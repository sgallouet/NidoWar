import { screenToWorld, worldToScreen, type Point } from '@engine/isometric';
import type { IsometricRenderer } from '@engine/renderer/IsometricRenderer';
import type { TileGrid } from './TileGrid';
import { MATERIAL_IDS, createTerrainBlend, type TerrainBlend, type TerrainMaterialId, type TerrainMaterialSet } from './TerrainMaterial';
import { resolveTerrainTransition, type TerrainTransition } from './TerrainTransition';

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

interface TerrainChunk {
  canvas: HTMLCanvasElement;
  minX: number;
  minY: number;
}

type TerrainSamplers = Record<TerrainMaterialId, TextureSampler>;

interface TerrainTextureOptions {
  readonly showRoads?: boolean;
  readonly lawnOnly?: boolean;
  readonly lawnImages?: readonly HTMLImageElement[];
}

const MATERIAL_OFFSETS: Record<TerrainMaterialId, { x: number; y: number }> = {
  grass: { x: 0, y: 0 },
  dirt: { x: 37, y: -19 },
  cobblestone: { x: -53, y: 41 },
  forest: { x: 71, y: 83 },
  water: { x: -97, y: -29 },
};

const MATERIAL_SAMPLE_SCALE: Record<TerrainMaterialId, number> = {
  grass: 1,
  dirt: 1,
  cobblestone: 1,
  forest: 1,
  water: 1,
};

export class TerrainTextureView {
  private readonly bounds: TerrainBounds;
  private readonly chunkSize = 256;
  private readonly chunkOverlap = 2;
  private readonly viewportPadding = 96;
  private readonly surfaceResolution = 1;
  private readonly chunks = new Map<string, TerrainChunk>();
  private readonly prewarmQueue: Array<{ x: number; y: number }> = [];
  private prewarmScheduled = false;
  private samplers: TerrainSamplers | null = null;
  private lawnSamplers: readonly TextureSampler[] | null = null;

  constructor(
    private readonly grid: TileGrid,
    private readonly materials: TerrainMaterialSet,
    private readonly tileWidth: number,
    private readonly tileHeight: number,
    private readonly options: TerrainTextureOptions = {}
  ) {
    this.bounds = this.createBounds();
  }

  getBounds(): TerrainBounds {
    return this.bounds;
  }

  draw(renderer: IsometricRenderer, origin: Point, zoom: number, camera: Point): void {
    const canvas = renderer.getCanvas();
    if (!canvas) return;

    const cameraOffset = worldToScreen(camera.x, camera.y, this.tileWidth, this.tileHeight);
    const visibleMinX = Math.max(
      this.bounds.minX,
      cameraOffset.x - origin.x / zoom - this.viewportPadding
    );
    const visibleMinY = Math.max(
      this.bounds.minY,
      cameraOffset.y - origin.y / zoom - this.viewportPadding
    );
    const visibleMaxX = Math.min(
      this.bounds.maxX,
      cameraOffset.x + (canvas.width - origin.x) / zoom + this.viewportPadding
    );
    const visibleMaxY = Math.min(
      this.bounds.maxY,
      cameraOffset.y + (canvas.height - origin.y) / zoom + this.viewportPadding
    );
    const startChunkX = Math.floor((visibleMinX - this.bounds.minX) / this.chunkSize);
    const endChunkX = Math.floor((visibleMaxX - this.bounds.minX) / this.chunkSize);
    const startChunkY = Math.floor((visibleMinY - this.bounds.minY) / this.chunkSize);
    const endChunkY = Math.floor((visibleMaxY - this.bounds.minY) / this.chunkSize);

    for (let chunkY = startChunkY; chunkY <= endChunkY; chunkY++) {
      for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX++) {
        const chunk = this.getChunk(chunkX, chunkY);

        renderer.drawScreenImage(
          chunk.canvas,
          origin.x + (chunk.minX - cameraOffset.x) * zoom,
          origin.y + (chunk.minY - cameraOffset.y) * zoom,
          zoom / this.surfaceResolution,
          'terrain'
        );
      }
    }

    this.schedulePrewarm(startChunkX, endChunkX, startChunkY, endChunkY);
  }

  private getChunk(chunkX: number, chunkY: number): TerrainChunk {
    const key = `${chunkX}:${chunkY}`;
    const cached = this.chunks.get(key);
    if (cached) return cached;

    const baseMinX = this.bounds.minX + chunkX * this.chunkSize;
    const baseMinY = this.bounds.minY + chunkY * this.chunkSize;
    const baseMaxX = Math.min(this.bounds.maxX, baseMinX + this.chunkSize);
    const baseMaxY = Math.min(this.bounds.maxY, baseMinY + this.chunkSize);
    const minX = Math.max(this.bounds.minX, baseMinX - this.chunkOverlap);
    const minY = Math.max(this.bounds.minY, baseMinY - this.chunkOverlap);
    const maxX = Math.min(this.bounds.maxX, baseMaxX + this.chunkOverlap);
    const maxY = Math.min(this.bounds.maxY, baseMaxY + this.chunkOverlap);
    const width = Math.ceil((maxX - minX) * this.surfaceResolution);
    const height = Math.ceil((maxY - minY) * this.surfaceResolution);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('[TerrainTextureView] Failed to create terrain canvas');

    const pixels = ctx.createImageData(width, height);
    const samplers = this.getSamplers();
    const lawnSamplers = this.options.lawnOnly ? this.getLawnSamplers() : null;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const screenX = x / this.surfaceResolution + minX;
        const screenY = y / this.surfaceResolution + minY;
        const world = screenToWorld(screenX, screenY, this.tileWidth, this.tileHeight);
        const index = (y * width + x) * 4;

        if (!this.isInsideMap(world.x, world.y)) {
          pixels.data[index + 3] = 0;
          continue;
        }

        const color = lawnSamplers
          ? this.gradeLawnColor(
            this.sampleLawnBlend(lawnSamplers, world.x, world.y, screenX, screenY),
            world.x,
            world.y,
            screenX,
            screenY
          )
          : this.sampleTerrainColor(samplers, world.x, world.y, screenX, screenY);

        pixels.data[index] = color[0];
        pixels.data[index + 1] = color[1];
        pixels.data[index + 2] = color[2];
        pixels.data[index + 3] = 255;
      }
    }

    ctx.putImageData(pixels, 0, 0);
    const chunk = { canvas, minX, minY };
    this.chunks.set(key, chunk);
    return chunk;
  }

  private schedulePrewarm(startChunkX: number, endChunkX: number, startChunkY: number, endChunkY: number): void {
    const margin = 2;

    for (let chunkY = startChunkY - margin; chunkY <= endChunkY + margin; chunkY++) {
      for (let chunkX = startChunkX - margin; chunkX <= endChunkX + margin; chunkX++) {
        if (!this.isValidChunk(chunkX, chunkY)) continue;
        if (chunkX >= startChunkX && chunkX <= endChunkX && chunkY >= startChunkY && chunkY <= endChunkY) continue;
        if (this.chunks.has(`${chunkX}:${chunkY}`)) continue;
        if (this.prewarmQueue.some((entry) => entry.x === chunkX && entry.y === chunkY)) continue;
        this.prewarmQueue.push({ x: chunkX, y: chunkY });
      }
    }

    this.prewarmNextChunk();
  }

  private prewarmNextChunk(): void {
    if (this.prewarmScheduled || this.prewarmQueue.length === 0) return;

    this.prewarmScheduled = true;
    window.setTimeout(() => {
      this.prewarmScheduled = false;
      const next = this.prewarmQueue.shift();
      if (next) {
        this.getChunk(next.x, next.y);
      }
      this.prewarmNextChunk();
    }, 0);
  }

  private isValidChunk(chunkX: number, chunkY: number): boolean {
    const minX = this.bounds.minX + chunkX * this.chunkSize;
    const minY = this.bounds.minY + chunkY * this.chunkSize;
    return minX < this.bounds.maxX &&
      minY < this.bounds.maxY &&
      minX + this.chunkSize > this.bounds.minX &&
      minY + this.chunkSize > this.bounds.minY;
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

  private getSamplers(): TerrainSamplers {
    if (!this.samplers) {
      this.samplers = this.createSamplers();
    }

    return this.samplers;
  }

  private getLawnSamplers(): readonly TextureSampler[] {
    if (!this.lawnSamplers) {
      const images = this.options.lawnImages ?? [];
      if (images.length < 3) {
        throw new Error('[TerrainTextureView] Lawn-only mode requires three lawn textures');
      }
      this.lawnSamplers = images.slice(0, 3).map((image) => this.createSampler(image));
    }

    return this.lawnSamplers;
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
    transition: TerrainTransition,
    screenX: number,
    screenY: number
  ): [number, number, number] {
    const color: [number, number, number] = [0, 0, 0];

    for (const id of MATERIAL_IDS) {
      const weight = transition.blend[id];
      if (weight <= 0) continue;

      const offset = MATERIAL_OFFSETS[id];
      const scale = MATERIAL_SAMPLE_SCALE[id];
      const sample = this.sample(
        samplers[id],
        screenX * scale + offset.x,
        screenY * scale + offset.y
      );
      color[0] += sample[0] * weight;
      color[1] += sample[1] * weight;
      color[2] += sample[2] * weight;
    }

    return [this.clamp(color[0]), this.clamp(color[1]), this.clamp(color[2])];
  }

  private sampleTerrainColor(
    samplers: TerrainSamplers,
    worldX: number,
    worldY: number,
    screenX: number,
    screenY: number
  ): [number, number, number] {
    const blend = this.getVisibleTerrainBlend(worldX, worldY);
    const mask = this.getTransitionMask(worldX, worldY, screenX, screenY);
    const transition = resolveTerrainTransition(blend, mask);

    return this.gradeTerrainColor(
      this.sampleBlend(samplers, transition, screenX, screenY),
      transition,
      screenX,
      screenY
    );
  }

  private sampleLawnBlend(
    samplers: readonly TextureSampler[],
    worldX: number,
    worldY: number,
    screenX: number,
    screenY: number
  ): [number, number, number] {
    const broad = this.valueNoise(worldX * 0.11 - 4.3, worldY * 0.11 + 7.9, 1301);
    const mid = this.valueNoise(worldX * 0.28 + 12.1, worldY * 0.28 - 8.4, 1303);
    const soft = this.valueNoise(worldX * 0.055 + 3.7, worldY * 0.055 + 2.1, 1307);
    const weights = [
      0.42 + (1 - broad) * 0.22,
      0.32 + broad * 0.2,
      0.24 + mid * 0.16 + soft * 0.08,
    ];
    const total = weights[0] + weights[1] + weights[2];
    const samples = [
      this.sample(samplers[0], screenX * 0.82 + 37, screenY * 0.82 - 61),
      this.sample(samplers[1], screenX * 0.72 - 281, screenY * 0.72 + 163),
      this.sample(samplers[2], screenX * 0.94 + 521, screenY * 0.94 - 349),
    ];
    const color: [number, number, number] = [0, 0, 0];

    for (let i = 0; i < samples.length; i++) {
      const weight = weights[i] / total;
      color[0] += samples[i][0] * weight;
      color[1] += samples[i][1] * weight;
      color[2] += samples[i][2] * weight;
    }

    return [this.clamp(color[0]), this.clamp(color[1]), this.clamp(color[2])];
  }

  private gradeLawnColor(
    color: [number, number, number],
    worldX: number,
    worldY: number,
    screenX: number,
    screenY: number
  ): [number, number, number] {
    const broad = this.valueNoise(worldX * 0.075, worldY * 0.075, 1409);
    const mid = this.valueNoise(worldX * 0.21 - 5.6, worldY * 0.21 + 2.8, 1417);
    let result = color;

    result = this.mixColor(result, [108, 137, 58], 0.1);
    result = this.lighten(result, (broad - 0.5) * 4 + (mid - 0.5) * 1.6);

    const worn = Math.max(0, this.valueNoise(worldX * 0.18 + 2.4, worldY * 0.18 - 11.8, 1423) - 0.68);
    result = this.mixColor(result, [118, 118, 71], worn * 0.1);

    const vignette = this.valueNoise(screenX * 0.006, screenY * 0.006, 1427);
    return this.lighten(result, (vignette - 0.5) * 1.2);
  }

  private gradeTerrainColor(
    color: [number, number, number],
    transition: TerrainTransition,
    screenX: number,
    screenY: number
  ): [number, number, number] {
    const broadPatch = this.valueNoise(screenX * 0.013, screenY * 0.013, 11);
    const finePatch = this.valueNoise(screenX * 0.045, screenY * 0.045, 37);
    const speckle = this.hash(screenX, screenY, 53) / 0xffffffff;
    let result = color;

    result = this.lighten(result, (finePatch - 0.5) * 1.4);
    result = this.mixColor(result, [43, 61, 49], Math.max(0, broadPatch - 0.68) * 0.025);
    result = this.applyTransitionAccent(result, transition, speckle);

    if (transition.blend.grass > 0.55) {
      result = this.mixColor(result, [112, 139, 69], transition.blend.grass * 0.1);
      result = this.lighten(result, 4 * transition.blend.grass);
    }

    if (transition.blend.water > 0.2) {
      result = this.mixColor(result, [38, 83, 96], transition.blend.water * 0.1);
      result = this.lighten(result, speckle > 0.965 ? 42 : 0);
    }

    if (transition.blend.cobblestone > 0.28) {
      result = this.mixColor(result, [193, 178, 138], transition.blend.cobblestone * 0.06);
    }

    return result;
  }

  private applyTransitionAccent(
    color: [number, number, number],
    transition: TerrainTransition,
    speckle: number
  ): [number, number, number] {
    const amount = transition.accentAmount;
    const pair = [transition.primary, transition.secondary].sort().join(':');
    let accent: [number, number, number] = [177, 150, 78];
    let strength = amount * 0.06;

    if (pair.includes('water')) {
      accent = speckle > 0.72 ? [137, 169, 151] : [48, 68, 65];
      strength = amount * 0.14;
    } else if (pair.includes('cobblestone')) {
      accent = speckle > 0.52 ? [193, 177, 132] : [74, 78, 74];
      strength = amount * 0.1;
    } else if (pair.includes('forest')) {
      accent = speckle > 0.62 ? [93, 122, 64] : [34, 64, 54];
      strength = amount * 0.1;
    } else if (pair.includes('dirt')) {
      accent = speckle > 0.5 ? [181, 138, 73] : [94, 66, 48];
      strength = amount * 0.09;
    }

    return this.mixColor(color, accent, strength);
  }

  private getTransitionMask(worldX: number, worldY: number, screenX: number, screenY: number): number {
    const broad = this.valueNoise(worldX * 1.7, worldY * 1.7, 71);
    const fine = this.hash(screenX, screenY, 109) / 0xffffffff;

    return Math.max(0, Math.min(1, broad * 0.72 + fine * 0.28));
  }

  private getVisibleTerrainBlend(worldX: number, worldY: number): TerrainBlend {
    const blend = this.grid.getTerrainBlend(worldX, worldY, this.options.showRoads !== false);
    if (this.options.showRoads !== false || blend.cobblestone <= 0) return blend;

    return createTerrainBlend({
      ...blend,
      dirt: blend.dirt + blend.cobblestone * 0.72,
      grass: blend.grass + blend.cobblestone * 0.28,
      cobblestone: 0,
    });
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
