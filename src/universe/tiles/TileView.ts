import type { TileData, TileDecalData } from './TileData';
import type { LoadedSpriteManifest } from '@engine/assets/AssetManifest';
import type { IsometricRenderer } from '@engine/renderer/IsometricRenderer';
import type { Point } from '@engine/isometric';

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
    private readonly image: HTMLImageElement,
    private readonly decalManifest: LoadedSpriteManifest,
    private readonly decalImage: HTMLImageElement
  ) {}

  draw(
    tile: TileData,
    viewX: number,
    viewY: number,
    tileWidth: number,
    tileHeight: number,
    offset: Point
  ): void {
    if (tile.type === 'grass') {
      this.renderer.drawIsometricSprite(
        viewX,
        viewY,
        this.image,
        this.manifest,
        0,
        tileWidth,
        tileHeight,
        offset
      );
      return;
    }

    this.renderer.drawIsometricTile(
      viewX,
      viewY,
      this.getColorForType(tile),
      this.manifest,
      tileWidth,
      tileHeight,
      offset
    );
  }

  drawDecal(
    decal: TileDecalData,
    viewX: number,
    viewY: number,
    tileWidth: number,
    tileHeight: number,
    offset: Point
  ): void {
    this.renderer.drawIsometricSprite(
      viewX + decal.offsetX,
      viewY + decal.offsetY,
      this.decalImage,
      this.decalManifest,
      decal.frameIndex,
      tileWidth,
      tileHeight,
      offset,
      tileWidth / this.manifest.frames[0].w
    );
  }

  private getColorForType(tile: TileData): string {
    switch (tile.type) {
      case 'grass':
        return '#4a7c3a';
      case 'forest':
        return '#2d5a2d';
      case 'water':
        return '#3a6a8a';
      default:
        return '#8b7355'; // dirt
    }
  }
}
