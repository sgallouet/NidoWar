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
        tiles.push(createTile(y * this.width + x, x, y, this.pickTerrain(x, y, fill)));
      }
    }

    return tiles;
  }

  private createDecals(): TileDecalData[] {
    const decals: TileDecalData[] = [];
    let id = 0;

    for (const tile of this.tiles) {
      if (tile.type !== 'grass') continue;

      const roll = this.hash(tile.x, tile.y, 19) % 100;
      if (roll > 8) continue;

      decals.push({
        id: id++,
        tileX: tile.x,
        tileY: tile.y,
        offsetX: (this.hash(tile.x, tile.y, 31) % 56) / 100 - 0.28,
        offsetY: (this.hash(tile.x, tile.y, 47) % 56) / 100 - 0.28,
        frameIndex: this.pickFrame(tile.x, tile.y),
      });
    }

    return decals;
  }

  private pickFrame(x: number, y: number): number {
    return this.hash(x, y, 83) % 24;
  }

  private pickTerrain(x: number, y: number, fallback: TerrainType): TerrainType {
    if (fallback !== 'grass') return fallback;

    const patches = [
      { x: this.width * 0.26, y: this.height * 0.26, rx: 7.5, ry: 5.5 },
      { x: this.width * 0.62, y: this.height * 0.38, rx: 8.5, ry: 6.0 },
      { x: this.width * 0.42, y: this.height * 0.72, rx: 6.5, ry: 4.5 },
    ];

    for (const patch of patches) {
      const dx = (x - patch.x) / patch.rx;
      const dy = (y - patch.y) / patch.ry;
      const edgeNoise = (this.hash(x, y, 71) % 100) / 450;
      if (dx * dx + dy * dy < 1 - edgeNoise) {
        return 'dirt';
      }
    }

    return 'grass';
  }

  private hash(x: number, y: number, seed: number): number {
    let value = x * 374761393 + y * 668265263 + seed * 2246822519;
    value = (value ^ (value >> 13)) * 1274126177;
    return Math.abs(value ^ (value >> 16));
  }
}
