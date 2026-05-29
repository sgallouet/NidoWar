/**
 * Thin wrapper that applies isometric math to the base IRenderer.
 * Accepts optional manifest data to influence placeholder sizing/anchoring.
 *
 * This is still a proof layer. The real Pixi (or final Canvas) implementation
 * will live behind the same pattern later.
 */

import type { IRenderer } from './IRenderer';
import type { RadialLightDrawOptions } from './IRenderer';
import { worldToScreen, DEFAULT_TILE } from '@engine/isometric';
import type { LoadedSpriteManifest } from '@engine/assets/AssetManifest';
import type { Point } from '@engine/isometric';

export class IsometricRenderer {
  constructor(private readonly inner: IRenderer) {}

  /**
   * Draw a tile using world coordinates.
   * If a manifest is provided, its first frame + scale influences the visual size
   * of the placeholder (real sprites will use the actual frame rects later).
   */
  drawIsometricTile(
    worldX: number,
    worldY: number,
    color: string,
    _manifest?: LoadedSpriteManifest,
    tileWidth: number = DEFAULT_TILE.width,
    tileHeight: number = DEFAULT_TILE.height,
    offset: Point = { x: 0, y: 0 }
  ): void {
    const pos = worldToScreen(worldX, worldY, tileWidth, tileHeight);

    // For the 1.3 proof we still delegate to the base drawTile.
    // Manifest data is accepted and could adjust size in a future pass.
    // (Keeps this file tiny while proving the data flow.)
    this.inner.drawTile(pos.x + offset.x, pos.y + offset.y, color);
  }

  drawIsometricSprite(
    worldX: number,
    worldY: number,
    image: HTMLImageElement,
    manifest: LoadedSpriteManifest,
    frameIndex = 0,
    tileWidth: number = DEFAULT_TILE.width,
    tileHeight: number = DEFAULT_TILE.height,
    offset: Point = { x: 0, y: 0 },
    spriteScale?: number
  ): void {
    const pos = worldToScreen(worldX, worldY, tileWidth, tileHeight);
    const frame = manifest.frames[frameIndex];
    const renderScale = spriteScale ?? tileWidth / (frame.w * manifest.scale);

    this.inner.drawSprite({
      image,
      manifest,
      frameIndex,
      screenX: pos.x + offset.x,
      screenY: pos.y + offset.y,
      scale: renderScale,
    });
  }

  drawScreenImage(
    image: HTMLImageElement | HTMLCanvasElement,
    screenX: number,
    screenY: number,
    scale = 1
  ): void {
    this.inner.drawImage({
      image,
      screenX,
      screenY,
      scale,
    });
  }

  drawNightLighting(
    ambientColor: string,
    ambientAlpha: number,
    lights: RadialLightDrawOptions[]
  ): void {
    this.inner.drawNightLighting(ambientColor, ambientAlpha, lights);
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.inner.getCanvas();
  }

  async waitReady(): Promise<void> {
    const maybeAsync = this.inner as IRenderer & { waitReady?: () => Promise<void> };
    await maybeAsync.waitReady?.();
  }

  clear(): void {
    this.inner.clear();
  }

  present(): void {
    this.inner.present();
  }
}
