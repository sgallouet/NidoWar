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
      zoom
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
        const grassColor = this.sample(grass, screenX, screenY);
        const dustColor = this.sample(dust, screenX + 37, screenY - 19);

        pixels.data[index] = this.mix(grassColor[0], dustColor[0], blend);
        pixels.data[index + 1] = this.mix(grassColor[1], dustColor[1], blend);
        pixels.data[index + 2] = this.mix(grassColor[2], dustColor[2], blend);
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
}
