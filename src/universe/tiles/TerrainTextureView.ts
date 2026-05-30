import { screenToWorld, worldToScreen, type Point } from '@engine/isometric';
import type { IsometricRenderer } from '@engine/renderer/IsometricRenderer';
import type { TileGrid } from './TileGrid';
import type { TerrainBlend, TerrainMaterialId, TerrainMaterialSet } from './TerrainMaterial';

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

type TerrainSamplers = Record<TerrainMaterialId, TextureSampler>;

const MATERIAL_IDS: TerrainMaterialId[] = ['grass', 'dirt', 'cobblestone', 'forest', 'water'];

const MATERIAL_OFFSETS: Record<TerrainMaterialId, { x: number; y: number }> = {
  grass: { x: 0, y: 0 },
  dirt: { x: 37, y: -19 },
  cobblestone: { x: -53, y: 41 },
  forest: { x: 71, y: 83 },
  water: { x: -97, y: -29 },
};

export class TerrainTextureView {
  private readonly bounds: TerrainBounds;
  private readonly surfaceResolution = 0.35;
  private surface: HTMLCanvasElement | null = null;

  constructor(
    private readonly grid: TileGrid,
    private readonly materials: TerrainMaterialSet,
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
      zoom / this.surfaceResolution,
      'terrain'
    );
  }

  private getSurface(): HTMLCanvasElement {
    if (this.surface) return this.surface;

    const width = Math.ceil((this.bounds.maxX - this.bounds.minX) * this.surfaceResolution);
    const height = Math.ceil((this.bounds.maxY - this.bounds.minY) * this.surfaceResolution);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('[TerrainTextureView] Failed to create terrain canvas');

    const pixels = ctx.createImageData(width, height);
    const samplers = this.createSamplers();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const screenX = x / this.surfaceResolution + this.bounds.minX;
        const screenY = y / this.surfaceResolution + this.bounds.minY;
        const world = screenToWorld(screenX, screenY, this.tileWidth, this.tileHeight);
        const index = (y * width + x) * 4;

        if (!this.isInsideMap(world.x, world.y)) {
          pixels.data[index + 3] = 0;
          continue;
        }

        const blend = this.grid.getTerrainBlend(world.x, world.y);
        const color = this.gradeTerrainColor(
          this.sampleBlend(samplers, blend, screenX, screenY),
          blend,
          screenX,
          screenY
        );

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

  private createSamplers(): TerrainSamplers {
    return {
      grass: this.createSampler(this.materials.grass.image),
      dirt: this.createSampler(this.materials.dirt.image),
      cobblestone: this.createSampler(this.materials.cobblestone.image),
      forest: this.createSampler(this.materials.forest.image),
      water: this.createSampler(this.materials.water.image),
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

  private sampleBlend(
    samplers: TerrainSamplers,
    blend: TerrainBlend,
    screenX: number,
    screenY: number
  ): [number, number, number] {
    const color: [number, number, number] = [0, 0, 0];

    for (const id of MATERIAL_IDS) {
      const weight = blend[id];
      if (weight <= 0) continue;

      const offset = MATERIAL_OFFSETS[id];
      const sample = this.sample(samplers[id], screenX + offset.x, screenY + offset.y);
      color[0] += sample[0] * weight;
      color[1] += sample[1] * weight;
      color[2] += sample[2] * weight;
    }

    return [this.clamp(color[0]), this.clamp(color[1]), this.clamp(color[2])];
  }

  private gradeTerrainColor(
    color: [number, number, number],
    blend: TerrainBlend,
    screenX: number,
    screenY: number
  ): [number, number, number] {
    const transition = 1 - Math.max(...MATERIAL_IDS.map((id) => blend[id]));
    const broadPatch = this.valueNoise(screenX * 0.013, screenY * 0.013, 11);
    const finePatch = this.valueNoise(screenX * 0.045, screenY * 0.045, 37);
    const speckle = this.hash(screenX, screenY, 53) / 0xffffffff;
    let result = color;

    result = this.lighten(result, (finePatch - 0.5) * 10);
    result = this.mixColor(result, [57, 86, 73], Math.max(0, broadPatch - 0.58) * 0.22);
    result = this.mixColor(result, [177, 150, 78], transition * 0.22);

    if (blend.water > 0.2) {
      result = this.mixColor(result, [38, 83, 96], blend.water * 0.18);
      result = this.lighten(result, speckle > 0.965 ? 42 : 0);
    }

    if (blend.cobblestone > 0.28) {
      result = this.mixColor(result, [193, 178, 138], blend.cobblestone * 0.12);
    }

    return result;
  }

  private isInsideMap(x: number, y: number): boolean {
    return x >= -0.5 &&
      y >= -0.5 &&
      x <= this.grid.map.width - 0.5 &&
      y <= this.grid.map.height - 0.5;
  }

  private sample(texture: TextureSampler, x: number, y: number): [number, number, number] {
    const sampleX = this.wrap(Math.floor(x), texture.width);
    const sampleY = this.wrap(Math.floor(y), texture.height);
    const index = (sampleY * texture.width + sampleX) * 4;

    return [
      texture.data[index],
      texture.data[index + 1],
      texture.data[index + 2],
    ];
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
