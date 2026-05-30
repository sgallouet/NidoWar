import { DecorationGenerator } from './DecorationGenerator';
import { LightSourceGenerator } from './LightSourceGenerator';
import { TerrainGenerator } from './TerrainGenerator';
import { createTile, type TerrainType, type TileData, type TileDecalData, type TileLightData } from './TileData';
import type { TerrainBlend } from './TerrainMaterial';

export class MapModel {
  private readonly tiles: TileData[];
  private readonly decals: TileDecalData[];
  private readonly props: TileDecalData[];
  private readonly torches: TileLightData[];
  private readonly terrain: TerrainGenerator;

  constructor(
    readonly width: number,
    readonly height: number,
    fill: TerrainType = 'grass'
  ) {
    this.terrain = new TerrainGenerator(width, height);
    this.tiles = this.createTiles(fill);
    const decoration = new DecorationGenerator(width, height, this.terrain);
    this.decals = decoration.createDecals(this.tiles);
    this.props = decoration.createProps(this.tiles);
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

  getTorches(): TileLightData[] {
    return this.torches;
  }

  getDirtBlend(x: number, y: number): number {
    return this.terrain.getDirtBlend(x, y);
  }

  getTerrainBlend(x: number, y: number): TerrainBlend {
    return this.terrain.getTerrainBlend(x, y);
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
