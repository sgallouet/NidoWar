import type { LoadedSpriteManifest } from '@engine/assets/AssetManifest';

export interface SpriteDrawOptions {
  image: HTMLImageElement;
  manifest: LoadedSpriteManifest;
  frameIndex?: number;
  screenX: number;
  screenY: number;
  scale?: number;
}

export interface ImageDrawOptions {
  image: HTMLImageElement | HTMLCanvasElement;
  screenX: number;
  screenY: number;
  scale?: number;
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
  getCanvas(): HTMLCanvasElement | null;
  present(): void;
}
