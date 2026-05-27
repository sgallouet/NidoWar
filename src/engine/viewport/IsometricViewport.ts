/**
 * IsometricViewport
 *
 * Technical orchestration for the isometric map view.
 * Owns renderer choice, camera, input, grid, manifest, culling, and render loop.
 */

import { Camera } from '../camera/Camera';
import { PointerInput } from '../input/PointerInput';
import { TileGrid } from '../../universe/tiles/TileGrid';
import { TileView } from '../../universe/tiles/TileView';
import { loadSpriteManifest, loadImage } from '../assets/AssetLoader';
import type { LoadedSpriteManifest } from '../assets/AssetManifest';
import { screenToWorld, worldToScreen } from '@engine/isometric';
import { Canvas2DRenderer } from '../renderer/Canvas2DRenderer';
import { IsometricRenderer } from '../renderer/IsometricRenderer';
import { PixiRenderer } from '../renderer/PixiRenderer';
import type { IRenderer } from '../renderer/IRenderer';
import type { TileData, TileDecalData } from '../../universe/tiles/TileData';

export interface ViewportOptions {
  usePixi?: boolean;
  mapWidth?: number;
  mapHeight?: number;
}

export class IsometricViewport {
  private camera = new Camera();
  private grid: TileGrid;
  private isoRenderer: IsometricRenderer;
  private manifest!: LoadedSpriteManifest;
  private decalManifest!: LoadedSpriteManifest;
  private tileView: TileView | null = null;
  private tileWidth = 64;
  private tileHeight = 32;
  private selectedTile: { x: number; y: number } | null = null;

  constructor(options: ViewportOptions = {}) {
    const mapW = options.mapWidth ?? 50;
    const mapH = options.mapHeight ?? 50;
    this.grid = new TileGrid(mapW, mapH);

    const baseRenderer: IRenderer = options.usePixi
      ? new PixiRenderer()
      : new Canvas2DRenderer();

    this.isoRenderer = new IsometricRenderer(baseRenderer);
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.isoRenderer.getCanvas();
  }

  async start(): Promise<void> {
    this.manifest = await loadSpriteManifest('/assets/manifests/grass_tile.json');
    this.decalManifest = await loadSpriteManifest('/assets/manifests/grass_decals.json');

    const imageUrl = `/assets/${this.manifest.image}`;
    const decalImageUrl = `/assets/${this.decalManifest.image}`;
    const tileImage = await loadImage(imageUrl);
    const decalImage = await loadImage(decalImageUrl);
    this.syncTileSizeFromManifest();
    this.tileView = new TileView(
      this.isoRenderer,
      this.manifest,
      tileImage,
      this.decalManifest,
      decalImage
    );

    await this.isoRenderer.waitReady();

    this.wireInput();
    window.addEventListener('resize', () => this.render());
    this.render();

    console.log('[IsometricViewport] Started. Drag to pan, wheel/pinch to zoom, tap to pick.');
  }

  private wireInput(): void {
    const target = document.getElementById('app') || document.body;

    new PointerInput(target, {
      onDrag: (dx, dy) => {
        const worldDelta = screenToWorld(
          -dx,
          -dy,
          this.getScaledTileWidth(),
          this.getScaledTileHeight()
        );
        this.camera.pan(worldDelta.x, worldDelta.y);
        this.render();
      },
      onZoom: (factor) => {
        this.camera.zoomBy(factor);
        this.render();
      },
      onTap: (point) => {
        this.selectedTile = this.pickTile(point.x, point.y);
        if (this.selectedTile) {
          console.log(`[IsometricViewport] selected tile ${this.selectedTile.x},${this.selectedTile.y}`);
        }
      },
    });
  }

  private render(): void {
    this.isoRenderer.clear();
    if (!this.tileView) return;

    const visible = this.getVisibleTiles();
    const visibleDecals = this.getVisibleDecals(visible);
    const origin = this.getCenteredMapOrigin();
    const tileWidth = this.getScaledTileWidth();
    const tileHeight = this.getScaledTileHeight();

    visible.sort((a, b) => (a.x + a.y) - (b.x + b.y));

    for (const tile of visible) {
      const viewPos = this.camera.worldToView(tile.x, tile.y);
      this.tileView.draw(tile, viewPos.x, viewPos.y, tileWidth, tileHeight, origin);
    }

    for (const decal of visibleDecals) {
      const viewPos = this.camera.worldToView(decal.tileX, decal.tileY);
      this.tileView.drawDecal(decal, viewPos.x, viewPos.y, tileWidth, tileHeight, origin);
    }

    this.isoRenderer.present();
  }

  private syncTileSizeFromManifest(): void {
    const frame = this.manifest.frames[0];
    const scaledWidth = frame.w * this.manifest.scale;

    this.tileWidth = scaledWidth;
    this.tileHeight = scaledWidth / 2;
  }

  private getCenteredMapOrigin(): { x: number; y: number } {
    const canvas = this.getCanvas();
    if (!canvas) return { x: 0, y: 0 };

    const bounds = this.getMapSpriteBounds();
    const mapWidth = bounds.maxX - bounds.minX;
    const mapHeight = bounds.maxY - bounds.minY;

    return {
      x: Math.round((canvas.width - mapWidth) / 2 - bounds.minX),
      y: Math.round((canvas.height - mapHeight) / 2 - bounds.minY),
    };
  }

  private getMapSpriteBounds(): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    const frame = this.manifest.frames[0];
    const center = frame.center;
    const scale = this.manifest.scale * this.camera.zoom;
    const tileWidth = this.getScaledTileWidth();
    const tileHeight = this.getScaledTileHeight();
    const bounds = {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    };

    for (const tile of this.grid.getAll()) {
      const screenPos = worldToScreen(tile.x, tile.y, tileWidth, tileHeight);
      const left = screenPos.x - center.x * scale;
      const top = screenPos.y - center.y * scale;
      const right = left + frame.w * scale;
      const bottom = top + frame.h * scale;

      bounds.minX = Math.min(bounds.minX, left);
      bounds.minY = Math.min(bounds.minY, top);
      bounds.maxX = Math.max(bounds.maxX, right);
      bounds.maxY = Math.max(bounds.maxY, bottom);
    }

    return bounds;
  }

  private getVisibleTiles(): TileData[] {
    const canvas = this.getCanvas();
    if (!canvas) return [];

    const origin = this.getCenteredMapOrigin();
    const frame = this.manifest.frames[0];
    const scale = this.manifest.scale * this.camera.zoom;
    const tileWidth = this.getScaledTileWidth();
    const tileHeight = this.getScaledTileHeight();
    const padding = 64;

    return this.grid.getAll().filter((tile) => {
      const viewPos = this.camera.worldToView(tile.x, tile.y);
      const screenPos = worldToScreen(viewPos.x, viewPos.y, tileWidth, tileHeight);
      const left = origin.x + screenPos.x - frame.center.x * scale;
      const top = origin.y + screenPos.y - frame.center.y * scale;
      const right = left + frame.w * scale;
      const bottom = top + frame.h * scale;

      return right >= -padding &&
        bottom >= -padding &&
        left <= canvas.width + padding &&
        top <= canvas.height + padding;
    });
  }

  private getVisibleDecals(visibleTiles: TileData[]): TileDecalData[] {
    const visibleIds = new Set(visibleTiles.map((tile) => tile.id));

    return this.grid.getDecals().filter((decal) => {
      const tile = this.grid.getTile(decal.tileX, decal.tileY);
      return tile ? visibleIds.has(tile.id) : false;
    });
  }

  private pickTile(screenX: number, screenY: number): { x: number; y: number } | null {
    const origin = this.getCenteredMapOrigin();
    const viewPoint = screenToWorld(
      screenX - origin.x,
      screenY - origin.y,
      this.getScaledTileWidth(),
      this.getScaledTileHeight()
    );
    const x = Math.floor(viewPoint.x + this.camera.x + 0.5);
    const y = Math.floor(viewPoint.y + this.camera.y + 0.5);

    return this.grid.getTile(x, y) ? { x, y } : null;
  }

  private getScaledTileWidth(): number {
    return this.tileWidth * this.camera.zoom;
  }

  private getScaledTileHeight(): number {
    return this.tileHeight * this.camera.zoom;
  }
}
