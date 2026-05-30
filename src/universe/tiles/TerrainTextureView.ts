import { screenToWorld, worldToScreen, type Point } from '@engine/isometric';
import type { IsometricRenderer } from '@engine/renderer/IsometricRenderer';
import type { TileGrid } from './TileGrid';

interface TerrainBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface TextureSampler {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export class TerrainTextureView {
  private readonly bounds: TerrainBounds;
  private surface: HTMLCanvasElement | null = null;

  constructor(
    private readonly grid: TileGrid,
    private readonly grassTexture: HTMLImageElement,
    private readonly dustTexture: HTMLImageElement,
    private readonly tileWidth: number,
    private readonly tileHeight: number
  ) {
    this.bounds = this.createBounds();
  }

  getBounds(): TerrainBounds {
    return this.bounds;
  }

  draw(renderer: IsometricRenderer, origin: Point, zoom: number, camera: Point): void {
    const surface = this.getSurface();
    const cameraOffset = worldToScreen(camera.x, camera.y, this.tileWidth, this.tileHeight);

    renderer.drawScreenImage(
      surface,
      origin.x + (this.bounds.minX - cameraOffset.x) * zoom,
      origin.y + (this.bounds.minY - cameraOffset.y) * zoom,
      zoom,
      'terrain'
    );
  }

  private getSurface(): HTMLCanvasElement {
    if (this.surface) return this.surface;

    const width = Math.ceil(this.bounds.maxX - this.bounds.minX);
    const height = Math.ceil(this.bounds.maxY - this.bounds.minY);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('[TerrainTextureView] Failed to create terrain canvas');

    const pixels = ctx.createImageData(width, height);
    const grass = this.createSampler(this.grassTexture);
    const dust = this.createSampler(this.dustTexture);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const screenX = x + this.bounds.minX;
        const screenY = y + this.bounds.minY;
        const world = screenToWorld(screenX, screenY, this.tileWidth, this.tileHeight);
        const index = (y * width + x) * 4;

        if (!this.isInsideMap(world.x, world.y)) {
          pixels.data[index + 3] = 0;
          continue;
        }

        const blend = this.grid.getDirtBlend(world.x, world.y);
        const edgeBand = 1 - Math.min(1, Math.abs(blend - 0.36) / 0.36);
        const broadGrassPatch = this.valueNoise(world.x * 0.08, world.y * 0.08, 11);
        const coolPatch = this.valueNoise(world.x * 0.16 + 17, world.y * 0.16 - 9, 23);
        const finePatch = this.valueNoise(screenX * 0.04, screenY * 0.04, 37);
        const speckle = this.hash(screenX, screenY, 53) / 0xffffffff;
        const grassColor = this.sample(grass, screenX, screenY, [126, 181, 42]);
        const dustColor = this.sample(dust, screenX + 37, screenY - 19, [166, 114, 66]);
        const dryGrassColor: [number, number, number] = [154, 159, 57];
        const darkGrassColor: [number, number, number] = [82, 139, 45];
        const coolShadowColor: [number, number, number] = [89, 151, 72];
        const edgeDustColor: [number, number, number] = [144, 108, 63];
        let color = grassColor;

        color = this.mixColor(color, darkGrassColor, Math.max(0, broadGrassPatch - 0.55) * 0.28);
        color = this.mixColor(color, coolShadowColor, Math.max(0, coolPatch - 0.62) * 0.18);
        color = this.lighten(color, (finePatch - 0.5) * 10);
        color = this.mixColor(color, dryGrassColor, edgeBand * 0.48);

        const dirtAmount = this.smoothstep(0.28, 0.82, blend);
        color = this.mixColor(color, dustColor, dirtAmount);
        color = this.mixColor(color, edgeDustColor, edgeBand * (speckle > 0.82 ? 0.42 : 0.08));

        pixels.data[index] = color[0];
        pixels.data[index + 1] = color[1];
        pixels.data[index + 2] = color[2];
        pixels.data[index + 3] = 255;
      }
    }

    ctx.putImageData(pixels, 0, 0);
    this.surface = canvas;
    return canvas;
  }

  private createBounds(): TerrainBounds {
    const corners = [
      worldToScreen(-0.5, -0.5, this.tileWidth, this.tileHeight),
      worldToScreen(this.grid.map.width - 0.5, -0.5, this.tileWidth, this.tileHeight),
      worldToScreen(this.grid.map.width - 0.5, this.grid.map.height - 0.5, this.tileWidth, this.tileHeight),
      worldToScreen(-0.5, this.grid.map.height - 0.5, this.tileWidth, this.tileHeight),
    ];

    return {
      minX: Math.floor(Math.min(...corners.map((corner) => corner.x))),
      minY: Math.floor(Math.min(...corners.map((corner) => corner.y))),
      maxX: Math.ceil(Math.max(...corners.map((corner) => corner.x))),
      maxY: Math.ceil(Math.max(...corners.map((corner) => corner.y))),
    };
  }

  private createSampler(image: HTMLImageElement): TextureSampler {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('[TerrainTextureView] Failed to sample terrain texture');

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0);

    return {
      data: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
      width: canvas.width,
      height: canvas.height,
    };
  }

  private isInsideMap(x: number, y: number): boolean {
    return x >= -0.5 &&
      y >= -0.5 &&
      x <= this.grid.map.width - 0.5 &&
      y <= this.grid.map.height - 0.5;
  }

  private sample(
    texture: TextureSampler,
    x: number,
    y: number,
    fallback: [number, number, number]
  ): [number, number, number] {
    if (texture.width <= 0 || texture.height <= 0) return fallback;

    const sampleX = this.wrap(Math.floor(x), texture.width);
    const sampleY = this.wrap(Math.floor(y), texture.height);
    const index = (sampleY * texture.width + sampleX) * 4;
    const color: [number, number, number] = [
      texture.data[index],
      texture.data[index + 1],
      texture.data[index + 2],
    ];

    return color.every(Number.isFinite) ? color : fallback;
  }

  private wrap(value: number, size: number): number {
    return ((value % size) + size) % size;
  }

  private mix(a: number, b: number, blend: number): number {
    return Math.round(a + (b - a) * blend);
  }

  private mixColor(
    a: [number, number, number],
    b: [number, number, number],
    blend: number
  ): [number, number, number] {
    const amount = Math.max(0, Math.min(1, blend));

    return [
      this.mix(a[0], b[0], amount),
      this.mix(a[1], b[1], amount),
      this.mix(a[2], b[2], amount),
    ];
  }

  private lighten(color: [number, number, number], amount: number): [number, number, number] {
    return [
      this.clamp(color[0] + amount),
      this.clamp(color[1] + amount),
      this.clamp(color[2] + amount),
    ];
  }

  private valueNoise(x: number, y: number, seed: number): number {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const xBlend = this.fade(x - x0);
    const yBlend = this.fade(y - y0);
    const a = this.hash(x0, y0, seed) / 0xffffffff;
    const b = this.hash(x0 + 1, y0, seed) / 0xffffffff;
    const c = this.hash(x0, y0 + 1, seed) / 0xffffffff;
    const d = this.hash(x0 + 1, y0 + 1, seed) / 0xffffffff;

    return this.lerp(this.lerp(a, b, xBlend), this.lerp(c, d, xBlend), yBlend);
  }

  private smoothstep(edge0: number, edge1: number, value: number): number {
    const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return amount * amount * (3 - 2 * amount);
  }

  private fade(value: number): number {
    return value * value * (3 - 2 * value);
  }

  private lerp(a: number, b: number, blend: number): number {
    return a + (b - a) * blend;
  }

  private hash(x: number, y: number, seed: number): number {
    let value = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 224682251);
    value = Math.imul(value ^ (value >>> 13), 1274126177);
    return (value ^ (value >>> 16)) >>> 0;
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
  }
}
