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

  getDirtBlend(x: number, y: number): number {
    const patches = [
      { x: this.width * 0.26, y: this.height * 0.26, rx: 7.5, ry: 5.5 },
      { x: this.width * 0.62, y: this.height * 0.38, rx: 8.5, ry: 6.0 },
      { x: this.width * 0.42, y: this.height * 0.72, rx: 6.5, ry: 4.5 },
    ];
    let blend = 0;

    for (const patch of patches) {
      const dx = (x - patch.x) / patch.rx;
      const dy = (y - patch.y) / patch.ry;
      const wobble =
        Math.sin(x * 1.13 + patch.y * 0.41) * 0.055 +
        Math.sin(y * 1.47 + patch.x * 0.33) * 0.045;
      const distance = Math.sqrt(dx * dx + dy * dy) + wobble;
      blend = Math.max(blend, 1 - this.smoothstep(0.72, 1.08, distance));
    }

    return Math.max(0, Math.min(1, blend));
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
      if (this.getDirtBlend(tile.x, tile.y) > 0.2) continue;

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

    return this.getDirtBlend(x, y) > 0.52 ? 'dirt' : 'grass';
  }

  private smoothstep(edge0: number, edge1: number, value: number): number {
    const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return amount * amount * (3 - 2 * amount);
  }

  private hash(x: number, y: number, seed: number): number {
    let value = x * 374761393 + y * 668265263 + seed * 2246822519;
    value = (value ^ (value >> 13)) * 1274126177;
    return Math.abs(value ^ (value >> 16));
  }
}
