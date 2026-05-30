import type { LoadedSpriteManifest } from '@engine/assets/AssetManifest';

export type RenderLayer = 'terrain' | 'decal' | 'prop' | 'unit' | 'lighting';

export interface SpriteDrawOptions {
  image: HTMLImageElement;
  manifest: LoadedSpriteManifest;
  frameIndex?: number;
  screenX: number;
  screenY: number;
  scale?: number;
  layer?: RenderLayer;
}

export interface ImageDrawOptions {
  image: HTMLImageElement | HTMLCanvasElement;
  screenX: number;
  screenY: number;
  scale?: number;
  layer?: RenderLayer;
}

export interface RadialLightDrawOptions {
  screenX: number;
  screenY: number;
  radius: number;
  color: string;
  intensity: number;
}

export interface RenderStats {
  drawCalls: number;
  visibleSprites: number;
  pooledSprites: number;
  stageChildren: number;
}

/**
 * Minimal renderer abstraction.
 * All concrete renderers (Canvas2D, later Pixi) implement this.
 * Game code never touches the underlying library.
 */
export interface IRenderer {
  clear(): void;
  drawTile(worldX: number, worldY: number, color: string): void;
  drawImage(options: ImageDrawOptions): void;
  drawSprite(options: SpriteDrawOptions): void;
  drawNightLighting(ambientColor: string, ambientAlpha: number, lights: RadialLightDrawOptions[]): void;
  getRenderStats(): RenderStats;
  getCanvas(): HTMLCanvasElement | null;
  present(): void;
}
