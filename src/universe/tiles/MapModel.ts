import { DecorationGenerator } from './DecorationGenerator';
import { LandmarkGenerator } from './LandmarkGenerator';
import { LightSourceGenerator } from './LightSourceGenerator';
import { OccluderGenerator } from './OccluderGenerator';
import { TerrainGenerator } from './TerrainGenerator';
import { createTile, type TerrainType, type TileData, type TileDecalData, type TileLightData, type TileOccluderData } from './TileData';
import type { TerrainBlend } from './TerrainMaterial';
import { WorldComposition } from './WorldComposition';

export class MapModel {
  private readonly tiles: TileData[];
  private readonly decals: TileDecalData[];
  private readonly props: TileDecalData[];
  private readonly occluders: TileOccluderData[];
  private readonly torches: TileLightData[];
  private readonly composition: WorldComposition;
  private readonly terrain: TerrainGenerator;

  constructor(
    readonly width: number,
    readonly height: number,
    fill: TerrainType = 'grass'
  ) {
    this.composition = new WorldComposition(width, height);
    this.terrain = new TerrainGenerator(width, height, this.composition);
    this.tiles = this.createTiles(fill);
    const decoration = new DecorationGenerator(width, height, this.terrain, this.composition);
    this.decals = decoration.createDecals(this.tiles);
    this.props = decoration.createProps(this.tiles);
    const terrainOccluders = new OccluderGenerator(width, height, this.terrain, this.composition).createOccluders(this.tiles);
    const landmarks = new LandmarkGenerator(width, height, this.terrain)
      .createLandmarks(terrainOccluders.length);
    this.occluders = [...terrainOccluders, ...landmarks];
    this.torches = new LightSourceGenerator(width, height).createTorches();
  }

  getAll(): TileData[] {
    return this.tiles;
  }

  getTile(x: number, y: number): TileData | null {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return null;
    }

    return this.tiles[y * this.width + x] ?? null;
  }

  getDecals(): TileDecalData[] {
    return this.decals;
  }

  getProps(): TileDecalData[] {
    return this.props;
  }

  getOccluders(): TileOccluderData[] {
    return this.occluders;
  }

  getTorches(): TileLightData[] {
    return this.torches;
  }

  getDirtBlend(x: number, y: number, includeRoads = true): number {
    return this.terrain.getDirtBlend(x, y, includeRoads);
  }

  getTerrainBlend(x: number, y: number, includeRoads = true): TerrainBlend {
    return this.terrain.getTerrainBlend(x, y, includeRoads);
  }

  private createTiles(fill: TerrainType): TileData[] {
    const tiles: TileData[] = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        tiles.push(createTile(y * this.width + x, x, y, this.terrain.pickTerrain(x, y, fill)));
      }
    }

    return tiles;
  }
}
