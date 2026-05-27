import { createTile, type TerrainType, type TileData, type TileDecalData } from './TileData';

export class MapModel {
  private readonly tiles: TileData[];
  private readonly decals: TileDecalData[];

  constructor(
    readonly width: number,
    readonly height: number,
    fill: TerrainType = 'grass'
  ) {
    this.tiles = this.createTiles(fill);
    this.decals = this.createDecals();
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

  private createTiles(fill: TerrainType): TileData[] {
    const tiles: TileData[] = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        tiles.push(createTile(y * this.width + x, x, y, fill));
      }
    }

    return tiles;
  }

  private createDecals(): TileDecalData[] {
    const decals: TileDecalData[] = [];
    let id = 0;

    for (const tile of this.tiles) {
      const roll = this.hash(tile.x, tile.y, 19) % 100;
      if (roll > 17) continue;

      decals.push({
        id: id++,
        tileX: tile.x,
        tileY: tile.y,
        offsetX: (this.hash(tile.x, tile.y, 31) % 56) / 100 - 0.28,
        offsetY: (this.hash(tile.x, tile.y, 47) % 56) / 100 - 0.28,
        frameIndex: this.pickFrame(roll),
      });
    }

    return decals;
  }

  private pickFrame(roll: number): number {
    if (roll < 5) return 0;
    if (roll < 9) return 1;
    if (roll < 12) return 2;
    return 3;
  }

  private hash(x: number, y: number, seed: number): number {
    let value = x * 374761393 + y * 668265263 + seed * 2246822519;
    value = (value ^ (value >> 13)) * 1274126177;
    return Math.abs(value ^ (value >> 16));
  }
}
