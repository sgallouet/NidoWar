import type { TileData, TileDecalData } from './TileData';
import type { TerrainGenerator } from './TerrainGenerator';
import { hash, smoothstep } from './TileRandom';

export class DecorationGenerator {
  constructor(
    private readonly width: number,
    private readonly height: number,
    private readonly terrain: TerrainGenerator
  ) {}

  createDecals(tiles: TileData[]): TileDecalData[] {
    const decals: TileDecalData[] = [];
    let id = 0;

    for (const tile of tiles) {
      const dirt = this.terrain.getDirtBlend(tile.x, tile.y);
      const edge = this.terrain.getDirtEdge(tile.x, tile.y);
      if (dirt > 0.68) continue;

      const flowerCluster = this.getClusterInfluence(tile.x, tile.y, 101, 11);
      const grassCluster = this.getClusterInfluence(tile.x, tile.y, 211, 9);
      const roll = hash(tile.x, tile.y, 19) % 1000;
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
          scale: 1.1 + (hash(tile.x, tile.y, 131 + i) % 5) / 10,
        });
      }
    }

    return decals;
  }

  createProps(tiles: TileData[]): TileDecalData[] {
    const props: TileDecalData[] = [];
    let id = 0;

    for (const tile of tiles) {
      const dirt = this.terrain.getDirtBlend(tile.x, tile.y);
      if (dirt > 0.82) continue;

      const edge = this.terrain.getDirtEdge(tile.x, tile.y);
      const grove = this.getClusterInfluence(tile.x, tile.y, 307, 7);
      const roll = hash(tile.x, tile.y, 283) % 1000;
      if (roll > 18 + edge * 85 + grove * 75) continue;

      props.push({
        id: id++,
        tileX: tile.x,
        tileY: tile.y,
        offsetX: this.pickOffset(tile.x, tile.y, 337) * 0.82,
        offsetY: this.pickOffset(tile.x, tile.y, 353) * 0.82,
        frameIndex: this.pickPropFrame(tile.x, tile.y, edge, grove),
        scale: 1.05 + (hash(tile.x, tile.y, 367) % 4) / 10,
      });
    }

    return props;
  }

  private pickFrame(
    x: number,
    y: number,
    variant: number,
    flowerCluster: number,
    edge: number
  ): number {
    if (edge > 0.45 && hash(x, y, 151 + variant) % 100 < 34) {
      return 16 + (hash(x, y, 157 + variant) % 8);
    }

    if (flowerCluster > 0.4) {
      return hash(x, y, 83 + variant) % 16;
    }

    return hash(x, y, 97 + variant) % 24;
  }

  private pickPropFrame(x: number, y: number, edge: number, grove: number): number {
    const roll = hash(x, y, 379) % 100;

    if (edge > 0.5) {
      if (roll < 48) return 2 + (hash(x, y, 383) % 2);
      if (roll < 72) return 4;
      return 6 + (hash(x, y, 389) % 2);
    }

    if (grove > 0.52) {
      return roll < 62 ? hash(x, y, 397) % 2 : 6 + (hash(x, y, 401) % 2);
    }

    if (roll < 42) return 6 + (hash(x, y, 409) % 2);
    if (roll < 68) return hash(x, y, 419) % 2;
    if (roll < 84) return 2 + (hash(x, y, 421) % 2);
    return 5;
  }

  private getClusterInfluence(x: number, y: number, seed: number, count: number): number {
    let influence = 0;

    for (let i = 0; i < count; i++) {
      const centerX = (hash(i, seed, 11) % (this.width * 100)) / 100;
      const centerY = (hash(i, seed, 17) % (this.height * 100)) / 100;
      const radius = 2.4 + (hash(i, seed, 23) % 30) / 10;
      const dx = (x - centerX) / radius;
      const dy = (y - centerY) / (radius * 0.72);
      influence = Math.max(influence, 1 - smoothstep(0.2, 1, Math.sqrt(dx * dx + dy * dy)));
    }

    return influence;
  }

  private pickOffset(x: number, y: number, seed: number): number {
    return (hash(x, y, seed) % 68) / 100 - 0.34;
  }
}
