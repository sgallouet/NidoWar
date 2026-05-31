import type { TileData, TileOccluderData } from './TileData';
import type { TerrainGenerator } from './TerrainGenerator';
import { hash, smoothstep } from './TileRandom';
import type { WorldComposition } from './WorldComposition';

export class OccluderGenerator {
  constructor(
    private readonly width: number,
    private readonly height: number,
    private readonly terrain: TerrainGenerator,
    private readonly composition: WorldComposition
  ) {}

  createOccluders(tiles: TileData[]): TileOccluderData[] {
    const occluders: TileOccluderData[] = [];
    let id = 0;

    for (const tile of tiles) {
      const blend = this.terrain.getTerrainBlend(tile.x, tile.y);
      if (blend.water > 0.28 || blend.cobblestone > 0.5) continue;

      const forestEdge = this.composition.getForestEdgeMask(tile.x, tile.y);
      const grove = this.getClusterInfluence(tile.x, tile.y, 911, 7);
      const ridge = this.getClusterInfluence(tile.x, tile.y, 1201, 5);
      const roll = hash(tile.x, tile.y, 917) % 1000;
      const chance = this.getOccluderChance(blend.forest, forestEdge, grove, ridge, blend.dirt);
      if (roll > chance) continue;

      const assetKey = this.pickOccluderAtlas(tile.x, tile.y, blend.forest, forestEdge, grove, ridge);
      const isTree = assetKey === 'tree_singles' || assetKey === 'tree_clusters';
      const count = assetKey === 'tree_singles' ? this.pickTreeCount(tile.x, tile.y, blend.forest, forestEdge, grove) : 1;

      for (let i = 0; i < count; i++) {
        occluders.push({
          id: id++,
          assetKey,
          tileX: tile.x,
          tileY: tile.y,
          offsetX: this.pickOffset(tile.x, tile.y, 919 + i * 29) * (assetKey === 'tree_clusters' ? 0.42 : isTree ? 0.92 : 0.62),
          offsetY: this.pickOffset(tile.x, tile.y, 923 + i * 31) * (assetKey === 'tree_clusters' ? 0.34 : isTree ? 0.76 : 0.62),
          frameIndex: this.pickFrame(tile.x, tile.y, i, assetKey, blend.forest, forestEdge, ridge),
          scale: this.pickScale(tile.x, tile.y, i, assetKey, blend.forest, forestEdge),
          shadowScale: isTree ? 0.92 : 0.95,
          depthBias: isTree ? 0.28 + i * 0.03 : 0.16,
        });
      }
    }

    return occluders;
  }

  private getOccluderChance(forest: number, forestEdge: number, grove: number, ridge: number, dirt: number): number {
    if (forest > 0.58) return 260 + grove * 70;
    if (forest > 0.34) return 180 + grove * 58;
    if (forestEdge > 0.46) return 115 + forestEdge * 92;
    if (grove > 0.52) return 70 + grove * 58;
    if (ridge > 0.55 && dirt < 0.42) return 35 + ridge * 52;
    return 0;
  }

  private pickOccluderAtlas(x: number, y: number, forest: number, forestEdge: number, grove: number, ridge: number): string {
    const roll = hash(x, y, 929) % 100;
    if (forest > 0.58 || forestEdge > 0.64) return roll < 82 ? 'tree_clusters' : roll < 94 ? 'tree_singles' : 'rock_props';
    if (forest > 0.28 || forestEdge > 0.42 || grove > 0.46) return roll < 62 ? 'tree_clusters' : roll < 90 ? 'tree_singles' : 'rock_props';
    if (ridge > 0.6) return 'rock_props';
    return 'tree_singles';
  }

  private pickFrame(x: number, y: number, variant: number, assetKey: string, forest: number, forestEdge: number, ridge: number): number {
    const roll = hash(x, y, 937) % 100;
    if (assetKey === 'tree_clusters') {
      return hash(x, y, 939 + variant * 13) % 12;
    }

    if (assetKey === 'tree_singles') {
      if ((forest > 0.58 || forestEdge > 0.6) && roll < 62) return hash(x, y, 941 + variant * 17) % 8;
      return hash(x, y, 943 + variant * 19) % 12;
    }

    if (ridge > 0.64 && roll < 58) return 8 + (hash(x, y, 947) % 8);
    return 4 + (hash(x, y, 953) % 12);
  }

  private pickScale(x: number, y: number, variant: number, assetKey: string, forest: number, forestEdge: number): number {
    const variance = (hash(x, y, 967 + variant * 23) % 17) / 100;
    if (assetKey === 'tree_clusters') {
      return 1.24 + variance * 0.36;
    }

    if (assetKey === 'tree_singles') {
      return (forest > 0.55 || forestEdge > 0.58 ? 0.86 : 0.74) + variance;
    }

    return 1.08 + variance * 0.65;
  }

  private pickTreeCount(x: number, y: number, forest: number, forestEdge: number, grove: number): number {
    const roll = hash(x, y, 971) % 100;
    const density = forest * 0.64 + forestEdge * 0.24 + grove * 0.12;

    if (density > 0.68 && roll < 16) return 3;
    if (density > 0.48 && roll < 34) return 2;
    return 1;
  }

  private getClusterInfluence(x: number, y: number, seed: number, count: number): number {
    let influence = 0;

    for (let i = 0; i < count; i++) {
      const centerX = (hash(i, seed, 11) % (this.width * 100)) / 100;
      const centerY = (hash(i, seed, 17) % (this.height * 100)) / 100;
      const radius = 2.7 + (hash(i, seed, 23) % 34) / 10;
      const dx = (x - centerX) / radius;
      const dy = (y - centerY) / (radius * 0.7);
      influence = Math.max(influence, 1 - smoothstep(0.18, 1, Math.sqrt(dx * dx + dy * dy)));
    }

    return influence;
  }

  private pickOffset(x: number, y: number, seed: number): number {
    return (hash(x, y, seed) % 68) / 100 - 0.34;
  }
}
