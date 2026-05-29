import { createTile, type TerrainType, type TileData, type TileDecalData, type TileLightData } from './TileData';

export class MapModel {
  private readonly tiles: TileData[];
  private readonly decals: TileDecalData[];
  private readonly props: TileDecalData[];
  private readonly torches: TileLightData[];

  constructor(
    readonly width: number,
    readonly height: number,
    fill: TerrainType = 'grass'
  ) {
    this.tiles = this.createTiles(fill);
    this.decals = this.createDecals();
    this.props = this.createProps();
    this.torches = this.createTorches();
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
      const dirt = this.getDirtBlend(tile.x, tile.y);
      const edge = this.getDirtEdge(tile.x, tile.y);
      if (dirt > 0.68) continue;

      const flowerCluster = this.getClusterInfluence(tile.x, tile.y, 101, 11);
      const grassCluster = this.getClusterInfluence(tile.x, tile.y, 211, 9);
      const roll = this.hash(tile.x, tile.y, 19) % 1000;
      const chance = 22 + flowerCluster * 210 + grassCluster * 90 + edge * 95;
      if (roll > chance) continue;

      const count = flowerCluster > 0.62 && roll % 3 === 0 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        decals.push({
          id: id++,
          tileX: tile.x,
          tileY: tile.y,
          offsetX: this.pickOffset(tile.x, tile.y, 31 + i * 17),
          offsetY: this.pickOffset(tile.x, tile.y, 47 + i * 19),
          frameIndex: this.pickFrame(tile.x, tile.y, i, flowerCluster, edge),
          scale: 1.1 + (this.hash(tile.x, tile.y, 131 + i) % 5) / 10,
        });
      }
    }

    return decals;
  }

  private createProps(): TileDecalData[] {
    const props: TileDecalData[] = [];
    let id = 0;

    for (const tile of this.tiles) {
      const dirt = this.getDirtBlend(tile.x, tile.y);
      if (dirt > 0.82) continue;

      const edge = this.getDirtEdge(tile.x, tile.y);
      const grove = this.getClusterInfluence(tile.x, tile.y, 307, 7);
      const roll = this.hash(tile.x, tile.y, 283) % 1000;
      const edgeChance = edge * 85;
      const groveChance = grove * 75;
      if (roll > 18 + edgeChance + groveChance) continue;

      const frameIndex = this.pickPropFrame(tile.x, tile.y, edge, grove);
      props.push({
        id: id++,
        tileX: tile.x,
        tileY: tile.y,
        offsetX: this.pickOffset(tile.x, tile.y, 337) * 0.82,
        offsetY: this.pickOffset(tile.x, tile.y, 353) * 0.82,
        frameIndex,
        scale: 1.05 + (this.hash(tile.x, tile.y, 367) % 4) / 10,
      });
    }

    return props;
  }

  private createTorches(): TileLightData[] {
    const positions = [
      { x: Math.floor(this.width * 0.18), y: Math.floor(this.height * 0.20) },
      { x: Math.floor(this.width * 0.44), y: Math.floor(this.height * 0.30) },
      { x: Math.floor(this.width * 0.72), y: Math.floor(this.height * 0.28) },
      { x: Math.floor(this.width * 0.30), y: Math.floor(this.height * 0.58) },
      { x: Math.floor(this.width * 0.58), y: Math.floor(this.height * 0.64) },
      { x: Math.floor(this.width * 0.78), y: Math.floor(this.height * 0.76) },
    ];

    return positions.map((position, id) => ({
      id,
      tileX: position.x,
      tileY: position.y,
      offsetX: ((this.hash(position.x, position.y, 431) % 34) / 100) - 0.17,
      offsetY: ((this.hash(position.x, position.y, 439) % 34) / 100) - 0.17,
      radius: 155 + (this.hash(position.x, position.y, 443) % 35),
      intensity: 0.72 + (this.hash(position.x, position.y, 449) % 12) / 100,
      color: '#ffb04d',
    }));
  }

  private pickFrame(
    x: number,
    y: number,
    variant: number,
    flowerCluster: number,
    edge: number
  ): number {
    if (edge > 0.45 && this.hash(x, y, 151 + variant) % 100 < 34) {
      return 16 + (this.hash(x, y, 157 + variant) % 8);
    }

    if (flowerCluster > 0.4) {
      return this.hash(x, y, 83 + variant) % 16;
    }

    return this.hash(x, y, 97 + variant) % 24;
  }

  private pickPropFrame(x: number, y: number, edge: number, grove: number): number {
    const roll = this.hash(x, y, 379) % 100;

    if (edge > 0.5) {
      if (roll < 48) return 2 + (this.hash(x, y, 383) % 2);
      if (roll < 72) return 4;
      return 6 + (this.hash(x, y, 389) % 2);
    }

    if (grove > 0.52) {
      return roll < 62 ? this.hash(x, y, 397) % 2 : 6 + (this.hash(x, y, 401) % 2);
    }

    if (roll < 42) return 6 + (this.hash(x, y, 409) % 2);
    if (roll < 68) return this.hash(x, y, 419) % 2;
    if (roll < 84) return 2 + (this.hash(x, y, 421) % 2);
    return 5;
  }

  private pickTerrain(x: number, y: number, fallback: TerrainType): TerrainType {
    if (fallback !== 'grass') return fallback;

    return this.getDirtBlend(x, y) > 0.52 ? 'dirt' : 'grass';
  }

  private smoothstep(edge0: number, edge1: number, value: number): number {
    const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return amount * amount * (3 - 2 * amount);
  }

  private getDirtEdge(x: number, y: number): number {
    const dirt = this.getDirtBlend(x, y);
    return 1 - Math.min(1, Math.abs(dirt - 0.38) / 0.38);
  }

  private getClusterInfluence(x: number, y: number, seed: number, count: number): number {
    let influence = 0;

    for (let i = 0; i < count; i++) {
      const centerX = (this.hash(i, seed, 11) % (this.width * 100)) / 100;
      const centerY = (this.hash(i, seed, 17) % (this.height * 100)) / 100;
      const radius = 2.4 + (this.hash(i, seed, 23) % 30) / 10;
      const dx = (x - centerX) / radius;
      const dy = (y - centerY) / (radius * 0.72);
      influence = Math.max(influence, 1 - this.smoothstep(0.2, 1, Math.sqrt(dx * dx + dy * dy)));
    }

    return influence;
  }

  private pickOffset(x: number, y: number, seed: number): number {
    return (this.hash(x, y, seed) % 68) / 100 - 0.34;
  }

  private hash(x: number, y: number, seed: number): number {
    let value = x * 374761393 + y * 668265263 + seed * 2246822519;
    value = (value ^ (value >> 13)) * 1274126177;
    return Math.abs(value ^ (value >> 16));
  }
}
