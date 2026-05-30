import { MapModel } from './MapModel';
import type { TileData, TileDecalData, TileLightData } from './TileData';
import type { TerrainBlend } from './TerrainMaterial';

export class TileGrid {
  readonly map: MapModel;

  constructor(width: number, height: number) {
    this.map = new MapModel(width, height);
  }

  getAll(): TileData[] {
    return this.map.getAll();
  }

  getTile(x: number, y: number): TileData | null {
    return this.map.getTile(x, y);
  }

  getDecals(): TileDecalData[] {
    return this.map.getDecals();
  }

  getProps(): TileDecalData[] {
    return this.map.getProps();
  }

  getTorches(): TileLightData[] {
    return this.map.getTorches();
  }

  getDirtBlend(x: number, y: number): number {
    return this.map.getDirtBlend(x, y);
  }

  getTerrainBlend(x: number, y: number): TerrainBlend {
    return this.map.getTerrainBlend(x, y);
  }
}
