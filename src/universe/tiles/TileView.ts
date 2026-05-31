import { worldToScreen } from '@engine/isometric';
import type { TileDecalData, TileLightData, TileOccluderData } from './TileData';
import type { LoadedSpriteManifest } from '@engine/assets/AssetManifest';
import type { IsometricRenderer } from '@engine/renderer/IsometricRenderer';
import type { Point } from '@engine/isometric';

export interface TileSpriteAtlas {
  readonly manifest: LoadedSpriteManifest;
  readonly image: HTMLImageElement;
}

/**
 * View for a tile. Knows how it wants to be drawn but does not know
 * anything about the concrete renderer (Pixi, Canvas, etc.).
 *
 * In 1.3 we added optional manifest support so the view can eventually
 * drive correct isometric sizing/anchoring from art data.
 */
export class TileView {
  private contactShadow: HTMLCanvasElement | null = null;
  private directionalShadow: HTMLCanvasElement | null = null;

  constructor(
    private readonly renderer: IsometricRenderer,
    private readonly manifest: LoadedSpriteManifest,
    private readonly atlases: ReadonlyMap<string, TileSpriteAtlas>,
    private readonly torchManifest: LoadedSpriteManifest,
    private readonly torchImage: HTMLImageElement
  ) {}

  drawDecal(
    decal: TileDecalData,
    viewX: number,
    viewY: number,
    tileWidth: number,
    tileHeight: number,
    offset: Point
  ): void {
    const atlas = this.atlases.get(decal.assetKey);
    if (!atlas) return;

    this.renderer.drawIsometricSprite(
      viewX + decal.offsetX,
      viewY + decal.offsetY,
      atlas.image,
      atlas.manifest,
      decal.frameIndex,
      tileWidth,
      tileHeight,
      offset,
      (tileWidth / this.manifest.frames[0].w) * decal.scale,
      'decal',
      decal.alpha,
      decal.tint
    );
  }

  drawProp(
    prop: TileDecalData,
    viewX: number,
    viewY: number,
    tileWidth: number,
    tileHeight: number,
    offset: Point
  ): void {
    const atlas = this.atlases.get(prop.assetKey);
    if (!atlas) return;

    this.renderer.drawIsometricSprite(
      viewX + prop.offsetX,
      viewY + prop.offsetY,
      atlas.image,
      atlas.manifest,
      prop.frameIndex,
      tileWidth,
      tileHeight,
      offset,
      (tileWidth / this.manifest.frames[0].w) * prop.scale,
      'prop',
      prop.alpha,
      prop.tint
    );
  }

  drawOccluderShadow(
    occluder: TileOccluderData,
    viewX: number,
    viewY: number,
    tileWidth: number,
    tileHeight: number,
    offset: Point
  ): void {
    const screenPos = worldToScreen(viewX + occluder.offsetX, viewY + occluder.offsetY, tileWidth, tileHeight);
    const scale = (tileWidth / this.manifest.frames[0].w) * occluder.scale * occluder.shadowScale;
    const sunScale = scale * 1.45;

    this.renderer.drawScreenImage(
      this.getDirectionalShadow(),
      offset.x + screenPos.x - 8 * sunScale,
      offset.y + screenPos.y + 4 * sunScale,
      sunScale,
      'decal'
    );

    this.renderer.drawScreenImage(
      this.getContactShadow(),
      offset.x + screenPos.x - 32 * scale,
      offset.y + screenPos.y - 12 * scale,
      scale,
      'decal'
    );
  }

  drawOccluder(
    occluder: TileOccluderData,
    viewX: number,
    viewY: number,
    tileWidth: number,
    tileHeight: number,
    offset: Point
  ): void {
    this.drawProp(occluder, viewX, viewY, tileWidth, tileHeight, offset);
  }

  drawTorch(
    torch: TileLightData,
    viewX: number,
    viewY: number,
    tileWidth: number,
    tileHeight: number,
    offset: Point
  ): void {
    this.renderer.drawIsometricSprite(
      viewX + torch.offsetX,
      viewY + torch.offsetY,
      this.torchImage,
      this.torchManifest,
      0,
      tileWidth,
      tileHeight,
      offset,
      tileWidth / this.manifest.frames[0].w,
      'prop'
    );
  }

  private getContactShadow(): HTMLCanvasElement {
    if (this.contactShadow) return this.contactShadow;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('[TileView] Failed to create contact shadow');

    const gradient = ctx.createRadialGradient(32, 12, 4, 32, 12, 32);
    gradient.addColorStop(0, 'rgba(8, 12, 10, 0.34)');
    gradient.addColorStop(0.58, 'rgba(8, 12, 10, 0.18)');
    gradient.addColorStop(1, 'rgba(8, 12, 10, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.contactShadow = canvas;
    return canvas;
  }

  private getDirectionalShadow(): HTMLCanvasElement {
    if (this.directionalShadow) return this.directionalShadow;

    const canvas = document.createElement('canvas');
    canvas.width = 112;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('[TileView] Failed to create directional shadow');

    const gradient = ctx.createRadialGradient(42, 18, 5, 42, 18, 58);
    gradient.addColorStop(0, 'rgba(6, 12, 22, 0.24)');
    gradient.addColorStop(0.52, 'rgba(6, 12, 22, 0.12)');
    gradient.addColorStop(1, 'rgba(6, 12, 22, 0)');
    ctx.fillStyle = gradient;
    ctx.transform(1, 0.12, -0.18, 1, 16, 3);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.directionalShadow = canvas;
    return canvas;
  }
}
