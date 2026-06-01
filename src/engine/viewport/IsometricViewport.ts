/**
 * IsometricViewport
 *
 * Technical orchestration for the isometric map view.
 * Owns renderer choice, camera, input, grid, manifest, culling, and render loop.
 */

import { Camera } from '../camera/Camera';
import { PointerInput } from '../input/PointerInput';
import { TileGrid } from '../../universe/tiles/TileGrid';
import { TileView, type TileSpriteAtlas } from '../../universe/tiles/TileView';
import { TerrainTextureView } from '../../universe/tiles/TerrainTextureView';
import { loadSpriteManifest, loadImage } from '../assets/AssetLoader';
import type { LoadedSpriteManifest } from '../assets/AssetManifest';
import { screenToWorld, worldToScreen } from '@engine/isometric';
import { IsometricRenderer } from '../renderer/IsometricRenderer';
import { PixiRenderer } from '../renderer/PixiRenderer';
import { createSceneLighting, DAY_LIGHTING_PROFILE, NIGHT_LIGHTING_PROFILE } from '../lighting/LightingProfile';
import type { TileData, TileDecalData, TileLightData, TileOccluderData } from '../../universe/tiles/TileData';
import type { RadialLightDrawOptions } from '../renderer/IRenderer';
import type { TerrainMaterial, TerrainMaterialId, TerrainMaterialSet } from '../../universe/tiles/TerrainMaterial';

interface Phase1RenderStats {
  frameMs: number;
  visualMode: VisualMode;
  visibleTiles: number;
  visibleDecals: number;
  visibleProps: number;
  visibleOccluders: number;
  torches: number;
  drawCalls: number;
  visibleSprites: number;
  pooledSprites: number;
  stageChildren: number;
}

type PhaseGateWindow = Window & {
  __NIDOWAR_PHASE1_STATS__?: Phase1RenderStats;
};

type VisualMode = 'base-art' | 'terrain-only' | 'roads' | 'lit-final';

interface VisualModeConfig {
  readonly showRoads: boolean;
  readonly showDecals: boolean;
  readonly showProps: boolean;
  readonly showOccluders: boolean;
  readonly showLandmarks: boolean;
  readonly showTorches: boolean;
  readonly showLighting: boolean;
}

export interface ViewportOptions {
  mapWidth?: number;
  mapHeight?: number;
  onFrameStats?: (stats: Phase1RenderStats) => void;
}

export class IsometricViewport {
  private camera = new Camera();
  private grid: TileGrid;
  private isoRenderer: IsometricRenderer;
  private manifest!: LoadedSpriteManifest;
  private torchManifest!: LoadedSpriteManifest;
  private terrainView: TerrainTextureView | null = null;
  private tileView: TileView | null = null;
  private tileWidth = 64;
  private tileHeight = 32;
  private selectedTile: { x: number; y: number } | null = null;
  private readonly debugPerf = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('debug');
  private readonly nightLighting = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('night');
  private readonly visualMode = this.readVisualMode();
  private readonly visualModeConfig = this.createVisualModeConfig(this.visualMode);
  private frameCount = 0;
  private readonly onFrameStats?: (stats: Phase1RenderStats) => void;

  constructor(options: ViewportOptions = {}) {
    const mapW = options.mapWidth ?? 50;
    const mapH = options.mapHeight ?? 50;
    this.grid = new TileGrid(mapW, mapH);
    this.camera.x = mapW * 0.5;
    this.camera.y = mapH * 0.52;
    this.camera.zoom = this.visualMode === 'base-art' ? 0.56 : 1;
    this.isoRenderer = new IsometricRenderer(new PixiRenderer());
    this.onFrameStats = options.onFrameStats;
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.isoRenderer.getCanvas();
  }

  async start(): Promise<void> {
    this.manifest = await loadSpriteManifest('/assets/manifests/grass_tile.json');
    const atlases = await this.loadDecorationAtlases();
    this.torchManifest = await loadSpriteManifest('/assets/manifests/torch.json');
    const terrainMaterials = await this.loadTerrainMaterials();
    const animeTerrainImages = await this.loadAnimeTerrainImages();

    const torchImageUrl = `/assets/${this.torchManifest.image}`;
    const torchImage = await loadImage(torchImageUrl);
    this.syncTileSizeFromManifest();
    this.terrainView = new TerrainTextureView(
      this.grid,
      terrainMaterials,
      this.tileWidth,
      this.tileHeight,
      {
        showRoads: this.visualModeConfig.showRoads,
        lawnOnly: this.visualMode === 'base-art',
        lawnImages: animeTerrainImages.lawn,
        dirtImage: animeTerrainImages.dirt,
        controlMaskImage: animeTerrainImages.controlMask,
      }
    );
    this.tileView = new TileView(
      this.isoRenderer,
      this.manifest,
      atlases,
      this.torchManifest,
      torchImage
    );

    await this.isoRenderer.waitReady();

    this.wireInput();
    window.addEventListener('resize', () => this.render());
    this.render();

    console.log(`[IsometricViewport] Started in ${this.visualMode} mode. Drag to pan, wheel/pinch to zoom, tap to pick.`);
  }

  private async loadTerrainMaterials(): Promise<TerrainMaterialSet> {
    const entries: Array<[TerrainMaterialId, string]> = [
      ['grass', '/assets/manifests/terrain_grass_meadow.json'],
      ['dirt', '/assets/manifests/terrain_dirt_path.json'],
      ['cobblestone', '/assets/manifests/terrain_cobblestone_road.json'],
      ['forest', '/assets/manifests/terrain_forest_floor.json'],
      ['water', '/assets/manifests/terrain_shallow_water.json'],
    ];
    const materials = await Promise.all(entries.map(([id, manifestUrl]) => (
      this.loadTerrainMaterial(id, manifestUrl)
    )));

    return Object.fromEntries(materials.map((material) => [material.id, material])) as TerrainMaterialSet;
  }

  private async loadAnimeTerrainImages(): Promise<{
    lawn: readonly HTMLImageElement[];
    dirt: HTMLImageElement;
    controlMask: HTMLImageElement;
  }> {
    const lawnUrls = [
      '/assets/sprites/terrain_anime_lawn_a.png',
      '/assets/sprites/terrain_anime_lawn_b.png',
      '/assets/sprites/terrain_anime_lawn_c.png',
    ];
    const [lawn, dirt, controlMask] = await Promise.all([
      Promise.all(lawnUrls.map((url) => loadImage(url))),
      loadImage('/assets/sprites/terrain_anime_dirt.png'),
      loadImage('/assets/sprites/terrain_control_layer_mask.png'),
    ]);

    return { lawn, dirt, controlMask };
  }

  private async loadDecorationAtlases(): Promise<ReadonlyMap<string, TileSpriteAtlas>> {
    const entries: Array<[string, string]> = [
      ['meadow_decals', '/assets/manifests/world_meadow_decals.json'],
      ['path_decals', '/assets/manifests/world_path_decals.json'],
      ['forest_decals', '/assets/manifests/world_forest_decals.json'],
      ['rock_props', '/assets/manifests/world_rock_props.json'],
      ['shrub_props', '/assets/manifests/world_shrub_props.json'],
      ['tree_clusters', '/assets/manifests/world_tree_clusters.json'],
      ['tree_singles', '/assets/manifests/world_tree_singles.json'],
      ['landmarks', '/assets/manifests/world_landmarks.json'],
    ];
    const atlases = new Map<string, TileSpriteAtlas>();

    await Promise.all(entries.map(async ([key, manifestUrl]) => {
      const manifest = await loadSpriteManifest(manifestUrl);
      const image = await loadImage(`/assets/${manifest.image}`);
      atlases.set(key, { manifest, image });
    }));

    return atlases;
  }

  private async loadTerrainMaterial(id: TerrainMaterialId, manifestUrl: string): Promise<TerrainMaterial> {
    const manifest = await loadSpriteManifest(manifestUrl);
    const image = await loadImage(`/assets/${manifest.image}`);

    return { id, image };
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
    const frameStart = performance.now();
    this.isoRenderer.clear();
    if (!this.tileView || !this.terrainView) return;

    const visible = this.getVisibleTiles();
    const visibleDecals = this.visualModeConfig.showDecals ? this.getVisibleDecals(visible) : [];
    const visibleProps = this.visualModeConfig.showProps ? this.getVisibleProps(visible) : [];
    const visibleOccluders = this.visualModeConfig.showOccluders ? this.getVisibleOccluders(visible) : [];
    const torches = this.visualModeConfig.showTorches ? this.grid.getTorches() : [];
    const origin = this.getCenteredMapOrigin();
    const tileWidth = this.getScaledTileWidth();
    const tileHeight = this.getScaledTileHeight();

    visible.sort((a, b) => (a.x + a.y) - (b.x + b.y));
    this.terrainView.draw(this.isoRenderer, origin, this.camera.zoom, this.camera);

    for (const decal of visibleDecals) {
      const viewPos = this.camera.worldToView(decal.tileX, decal.tileY);
      this.tileView.drawDecal(decal, viewPos.x, viewPos.y, tileWidth, tileHeight, origin);
    }

    const depthProps = [...visibleProps, ...visibleOccluders]
      .sort((a, b) => this.getDepthKey(a) - this.getDepthKey(b));

    for (const prop of depthProps) {
      const viewPos = this.camera.worldToView(prop.tileX, prop.tileY);
      if (this.isOccluder(prop)) {
        this.tileView.drawOccluderShadow(prop, viewPos.x, viewPos.y, tileWidth, tileHeight, origin);
        this.tileView.drawOccluder(prop, viewPos.x, viewPos.y, tileWidth, tileHeight, origin);
      } else {
        this.tileView.drawProp(prop, viewPos.x, viewPos.y, tileWidth, tileHeight, origin);
      }
    }

    for (const torch of torches) {
      const viewPos = this.camera.worldToView(torch.tileX, torch.tileY);
      this.tileView.drawTorch(torch, viewPos.x, viewPos.y, tileWidth, tileHeight, origin);
    }

    if (this.visualModeConfig.showLighting) {
      this.isoRenderer.drawSceneLighting(createSceneLighting(
        this.nightLighting ? NIGHT_LIGHTING_PROFILE : DAY_LIGHTING_PROFILE,
        this.getLights(torches, origin, tileWidth, tileHeight)
      ));
    }

    this.isoRenderer.present();
    this.publishPhase1Stats({
      frameMs: performance.now() - frameStart,
      visualMode: this.visualMode,
      visibleTiles: visible.length,
      visibleDecals: visibleDecals.length,
      visibleProps: visibleProps.length,
      visibleOccluders: visibleOccluders.length,
      torches: torches.length,
      ...this.isoRenderer.getRenderStats(),
    });
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

    return {
      x: Math.round(canvas.width * 0.5),
      y: Math.round(canvas.height * 0.5),
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
      if (!this.visualModeConfig.showRoads && this.isRoadDecal(decal)) return false;
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

  private getVisibleOccluders(visibleTiles: TileData[]): TileOccluderData[] {
    const visibleIds = new Set(visibleTiles.map((tile) => tile.id));

    return this.grid.getOccluders().filter((occluder) => {
      if (!this.visualModeConfig.showLandmarks && occluder.assetKey === 'landmarks') return false;
      const tile = this.grid.getTile(occluder.tileX, occluder.tileY);
      return tile ? visibleIds.has(tile.id) : false;
    });
  }

  private isRoadDecal(decal: TileDecalData): boolean {
    return decal.assetKey === 'path_decals';
  }

  private getDepthKey(prop: TileDecalData | TileOccluderData): number {
    const bias = this.isOccluder(prop) ? prop.depthBias : 0;
    return prop.tileX + prop.tileY + prop.offsetX * 0.2 + prop.offsetY * 0.2 + bias;
  }

  private isOccluder(prop: TileDecalData | TileOccluderData): prop is TileOccluderData {
    return 'depthBias' in prop;
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

  private publishPhase1Stats(stats: Phase1RenderStats): void {
    (window as PhaseGateWindow).__NIDOWAR_PHASE1_STATS__ = stats;
    document.documentElement.dataset.nidowarVisualMode = this.visualMode;
    document.documentElement.dataset.nidowarPhase1Stats = JSON.stringify(stats);
    this.onFrameStats?.(stats);

    if (!this.debugPerf) return;

    this.frameCount++;
    if (this.frameCount % 30 === 0) {
      console.table(stats);
    }
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

  private readVisualMode(): VisualMode {
    if (typeof window === 'undefined') return 'lit-final';

    const params = new URLSearchParams(window.location.search);
    const raw = params.get('visual') ?? params.get('visualMode') ?? params.get('mode');
    if (raw === 'base-art' || raw === 'terrain-only' || raw === 'roads' || raw === 'lit-final') return raw;
    return 'lit-final';
  }

  private createVisualModeConfig(mode: VisualMode): VisualModeConfig {
    if (mode === 'base-art') {
      return {
        showRoads: false,
        showDecals: false,
        showProps: false,
        showOccluders: false,
        showLandmarks: false,
        showTorches: false,
        showLighting: false,
      };
    }

    if (mode === 'terrain-only') {
      return {
        showRoads: false,
        showDecals: true,
        showProps: false,
        showOccluders: false,
        showLandmarks: false,
        showTorches: false,
        showLighting: false,
      };
    }

    if (mode === 'roads') {
      return {
        showRoads: true,
        showDecals: true,
        showProps: true,
        showOccluders: true,
        showLandmarks: false,
        showTorches: false,
        showLighting: false,
      };
    }

    return {
      showRoads: true,
      showDecals: true,
      showProps: true,
      showOccluders: true,
      showLandmarks: true,
      showTorches: true,
      showLighting: true,
    };
  }
}
