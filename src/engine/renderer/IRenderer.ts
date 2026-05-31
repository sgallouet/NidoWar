import type { LoadedSpriteManifest } from '@engine/assets/AssetManifest';

export type RenderLayer = 'terrain' | 'decal' | 'prop' | 'unit' | 'lighting';

export interface SpriteDrawOptions {
  image: HTMLImageElement;
  manifest: LoadedSpriteManifest;
  frameIndex?: number;
  screenX: number;
  screenY: number;
  scale?: number;
  alpha?: number;
  tint?: string;
  layer?: RenderLayer;
}

export interface ImageDrawOptions {
  image: HTMLImageElement | HTMLCanvasElement;
  screenX: number;
  screenY: number;
  scale?: number;
  alpha?: number;
  tint?: string;
  layer?: RenderLayer;
}

export interface RadialLightDrawOptions {
  screenX: number;
  screenY: number;
  radius: number;
  color: string;
  intensity: number;
  coreRadius?: number;
  coreIntensity?: number;
}

export interface SceneLightingDrawOptions {
  ambientColor: string;
  ambientAlpha: number;
  gradeColor: string;
  gradeAlpha: number;
  lights: RadialLightDrawOptions[];
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
  drawSceneLighting(options: SceneLightingDrawOptions): void;
  getRenderStats(): RenderStats;
  getCanvas(): HTMLCanvasElement | null;
  present(): void;
}
