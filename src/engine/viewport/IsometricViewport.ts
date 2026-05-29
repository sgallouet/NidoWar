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
import { TerrainTextureView } from '../../universe/tiles/TerrainTextureView';
import { loadSpriteManifest, loadImage } from '../assets/AssetLoader';
import type { LoadedSpriteManifest } from '../assets/AssetManifest';
import { screenToWorld, worldToScreen } from '@engine/isometric';
import { Canvas2DRenderer } from '../renderer/Canvas2DRenderer';
import { IsometricRenderer } from '../renderer/IsometricRenderer';
import { PixiRenderer } from '../renderer/PixiRenderer';
import type { IRenderer } from '../renderer/IRenderer';
import type { TileData, TileDecalData, TileLightData } from '../../universe/tiles/TileData';
import type { RadialLightDrawOptions } from '../renderer/IRenderer';

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
  private propManifest!: LoadedSpriteManifest;
  private torchManifest!: LoadedSpriteManifest;
  private terrainView: TerrainTextureView | null = null;
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
    this.propManifest = await loadSpriteManifest('/assets/manifests/terrain_props.json');
    this.torchManifest = await loadSpriteManifest('/assets/manifests/torch.json');

    const decalImageUrl = `/assets/${this.decalManifest.image}`;
    const propImageUrl = `/assets/${this.propManifest.image}`;
    const torchImageUrl = `/assets/${this.torchManifest.image}`;
    const grassTexture = await loadImage('/assets/sprites/terrain_grass.png');
    const dustTexture = await loadImage('/assets/sprites/terrain_dust.png');
    const decalImage = await loadImage(decalImageUrl);
    const propImage = await loadImage(propImageUrl);
    const torchImage = await loadImage(torchImageUrl);
    this.syncTileSizeFromManifest();
    this.terrainView = new TerrainTextureView(
      this.grid,
      grassTexture,
      dustTexture,
      this.tileWidth,
      this.tileHeight
    );
    this.tileView = new TileView(
      this.isoRenderer,
      this.manifest,
      this.decalManifest,
      decalImage,
      this.propManifest,
      propImage,
      this.torchManifest,
      torchImage
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
    if (!this.tileView || !this.terrainView) return;

    const visible = this.getVisibleTiles();
    const visibleDecals = this.getVisibleDecals(visible);
    const visibleProps = this.getVisibleProps(visible);
    const torches = this.grid.getTorches();
    const origin = this.getCenteredMapOrigin();
    const tileWidth = this.getScaledTileWidth();
    const tileHeight = this.getScaledTileHeight();

    visible.sort((a, b) => (a.x + a.y) - (b.x + b.y));
    this.terrainView.draw(this.isoRenderer, origin, this.camera.zoom, this.camera);

    for (const decal of visibleDecals) {
      const viewPos = this.camera.worldToView(decal.tileX, decal.tileY);
      this.tileView.drawDecal(decal, viewPos.x, viewPos.y, tileWidth, tileHeight, origin);
    }

    for (const prop of visibleProps) {
      const viewPos = this.camera.worldToView(prop.tileX, prop.tileY);
      this.tileView.drawProp(prop, viewPos.x, viewPos.y, tileWidth, tileHeight, origin);
    }

    for (const torch of torches) {
      const viewPos = this.camera.worldToView(torch.tileX, torch.tileY);
      this.tileView.drawTorch(torch, viewPos.x, viewPos.y, tileWidth, tileHeight, origin);
    }

    this.isoRenderer.drawNightLighting(
      '#071025',
      0.68,
      this.getLights(torches, origin, tileWidth, tileHeight)
    );

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
    if (!canvas || !this.terrainView) return { x: 0, y: 0 };

    const bounds = this.terrainView.getBounds();
    const zoom = this.camera.zoom;
    const mapWidth = (bounds.maxX - bounds.minX) * zoom;
    const mapHeight = (bounds.maxY - bounds.minY) * zoom;

    return {
      x: Math.round((canvas.width - mapWidth) / 2 - bounds.minX * zoom),
      y: Math.round((canvas.height - mapHeight) / 2 - bounds.minY * zoom),
    };
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

  private getVisibleProps(visibleTiles: TileData[]): TileDecalData[] {
    const visibleIds = new Set(visibleTiles.map((tile) => tile.id));

    return this.grid.getProps().filter((prop) => {
      const tile = this.grid.getTile(prop.tileX, prop.tileY);
      return tile ? visibleIds.has(tile.id) : false;
    });
  }

  private getLights(
    torches: TileLightData[],
    origin: { x: number; y: number },
    tileWidth: number,
    tileHeight: number
  ): RadialLightDrawOptions[] {
    return torches.map((torch) => {
      const viewPos = this.camera.worldToView(torch.tileX + torch.offsetX, torch.tileY + torch.offsetY);
      const screenPos = worldToScreen(viewPos.x, viewPos.y, tileWidth, tileHeight);

      return {
        screenX: origin.x + screenPos.x,
        screenY: origin.y + screenPos.y - 34 * this.camera.zoom,
        radius: torch.radius * this.camera.zoom,
        intensity: torch.intensity,
        color: torch.color,
      };
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
