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
      const blend = this.terrain.getTerrainBlend(tile.x, tile.y);
      const edge = this.terrain.getDirtEdge(tile.x, tile.y);
      if (blend.water > 0.36) continue;

      const flowerCluster = this.getClusterInfluence(tile.x, tile.y, 101, 11);
      const grassCluster = this.getClusterInfluence(tile.x, tile.y, 211, 9);
      const forestCluster = this.getClusterInfluence(tile.x, tile.y, 241, 8);
      const roll = hash(tile.x, tile.y, 19) % 1000;
      const chance = this.getDecalChance(dirt, blend.forest, flowerCluster, grassCluster, forestCluster, edge);
      if (roll > chance) continue;

      const count = flowerCluster > 0.62 && roll % 3 === 0 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const assetKey = this.pickDecalAtlas(tile.x, tile.y, dirt, blend.forest, edge);
        decals.push({
          id: id++,
          assetKey,
          tileX: tile.x,
          tileY: tile.y,
          offsetX: this.pickOffset(tile.x, tile.y, 31 + i * 17),
          offsetY: this.pickOffset(tile.x, tile.y, 47 + i * 19),
          frameIndex: this.pickFrame(tile.x, tile.y, i, assetKey, flowerCluster, forestCluster, edge),
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
      const blend = this.terrain.getTerrainBlend(tile.x, tile.y);
      if (blend.water > 0.42 || blend.cobblestone > 0.66) continue;

      const edge = this.terrain.getDirtEdge(tile.x, tile.y);
      const grove = this.getClusterInfluence(tile.x, tile.y, 307, 7);
      const landmark = this.getClusterInfluence(tile.x, tile.y, 431, 4);
      const roll = hash(tile.x, tile.y, 283) % 1000;
      if (roll > 22 + edge * 70 + grove * 95 + landmark * 55 + blend.forest * 62) continue;

      props.push({
        id: id++,
        assetKey: 'world_props',
        tileX: tile.x,
        tileY: tile.y,
        offsetX: this.pickOffset(tile.x, tile.y, 337) * 0.82,
        offsetY: this.pickOffset(tile.x, tile.y, 353) * 0.82,
        frameIndex: this.pickPropFrame(tile.x, tile.y, edge, grove, landmark, blend.forest),
        scale: 1.05 + (hash(tile.x, tile.y, 367) % 4) / 10,
      });
    }

    return props;
  }

  private pickFrame(
    x: number,
    y: number,
    variant: number,
    assetKey: string,
    flowerCluster: number,
    forestCluster: number,
    edge: number
  ): number {
    if (assetKey === 'path_decals') {
      return 16 + (hash(x, y, 157 + variant) % 8);
    }

    if (assetKey === 'forest_decals') {
      return forestCluster > 0.52
        ? hash(x, y, 173 + variant) % 16
        : 16 + (hash(x, y, 179 + variant) % 16);
    }

    if (edge > 0.45 && hash(x, y, 151 + variant) % 100 < 34) {
      return 24 + (hash(x, y, 157 + variant) % 8);
    }

    if (flowerCluster > 0.4) {
      return hash(x, y, 83 + variant) % 16;
    }

    return 16 + (hash(x, y, 97 + variant) % 16);
  }

  private pickPropFrame(
    x: number,
    y: number,
    edge: number,
    grove: number,
    landmark: number,
    forest: number
  ): number {
    const roll = hash(x, y, 379) % 100;

    if (landmark > 0.66 && roll < 42) {
      return 24 + (hash(x, y, 381) % 8);
    }

    if (forest > 0.45 || grove > 0.64) {
      if (roll < 42) return 8 + (hash(x, y, 397) % 8);
      if (roll < 78) return 16 + (hash(x, y, 401) % 8);
      return 4 + (hash(x, y, 403) % 4);
    }

    if (edge > 0.5) {
      if (roll < 36) return 4 + (hash(x, y, 383) % 4);
      if (roll < 68) return 16 + (hash(x, y, 389) % 8);
      return hash(x, y, 391) % 4;
    }

    if (roll < 36) return 8 + (hash(x, y, 409) % 8);
    if (roll < 62) return hash(x, y, 419) % 4;
    if (roll < 84) return 16 + (hash(x, y, 421) % 8);
    return 24 + (hash(x, y, 423) % 8);
  }

  private getDecalChance(
    dirt: number,
    forest: number,
    flowerCluster: number,
    grassCluster: number,
    forestCluster: number,
    edge: number
  ): number {
    const base = 18 + flowerCluster * 145 + grassCluster * 82 + edge * 108;
    const terrainBoost = forest > 0.36 ? 115 + forestCluster * 132 : 0;
    const pathBoost = dirt > 0.38 ? 76 : 0;
    return base + terrainBoost + pathBoost;
  }

  private pickDecalAtlas(x: number, y: number, dirt: number, forest: number, edge: number): string {
    const roll = hash(x, y, 149) % 100;

    if (forest > 0.42 && roll < 78) return 'forest_decals';
    if ((dirt > 0.36 || edge > 0.52) && roll < 70) return 'path_decals';
    return 'meadow_decals';
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
