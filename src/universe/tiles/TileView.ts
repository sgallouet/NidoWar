import type { TileDecalData, TileLightData } from './TileData';
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
      'decal'
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
      'prop'
    );
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
}
