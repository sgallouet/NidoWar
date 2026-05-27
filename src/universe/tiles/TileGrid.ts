import { MapModel } from './MapModel';
import type { TileData, TileDecalData } from './TileData';

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
}
