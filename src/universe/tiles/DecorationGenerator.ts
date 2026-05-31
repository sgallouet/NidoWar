import type { TileData, TileDecalData } from './TileData';
import type { TerrainGenerator } from './TerrainGenerator';
import { hash, smoothstep } from './TileRandom';
import type { WorldComposition } from './WorldComposition';

const SHRUB_GROUND_FRAMES = [3, 5, 6, 7, 8, 9, 11, 12, 14, 15, 17, 18, 19] as const;

export class DecorationGenerator {
  constructor(
    private readonly width: number,
    private readonly height: number,
    private readonly terrain: TerrainGenerator,
    private readonly composition: WorldComposition
  ) {}

  createDecals(tiles: TileData[]): TileDecalData[] {
    const decals: TileDecalData[] = [];
    let id = 0;

    for (const tile of tiles) {
      const dirt = this.terrain.getDirtBlend(tile.x, tile.y);
      const blend = this.terrain.getTerrainBlend(tile.x, tile.y);
      const edge = this.terrain.getDirtEdge(tile.x, tile.y);
      if (blend.water > 0.36) continue;

      id = this.addEdgeBrushDecals(decals, id, tile, edge, dirt);

      const flowerCluster = this.getClusterInfluence(tile.x, tile.y, 101, 11);
      const grassCluster = this.getClusterInfluence(tile.x, tile.y, 211, 9);
      const forestCluster = this.getClusterInfluence(tile.x, tile.y, 241, 8);
      const meadowCore = this.composition.getMeadowCoreMask(tile.x, tile.y);
      const roll = hash(tile.x, tile.y, 19) % 1000;
      const chance = this.getDecalChance(dirt, blend.forest, flowerCluster, grassCluster, forestCluster, edge, meadowCore);
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
      const meadowCore = this.composition.getMeadowCoreMask(tile.x, tile.y);
      const grove = this.getClusterInfluence(tile.x, tile.y, 307, 7);
      const landmark = this.getClusterInfluence(tile.x, tile.y, 431, 4);
      const canopy = this.getClusterInfluence(tile.x, tile.y, 719, 6);
      const roll = hash(tile.x, tile.y, 283) % 1000;
      const chance = this.getPropChance(edge, grove, landmark, blend.forest, canopy, meadowCore);
      if (roll > chance) continue;

      const assetKey = this.pickPropAtlas(tile.x, tile.y, edge, grove, landmark, blend.forest, canopy);

      props.push({
        id: id++,
        assetKey,
        tileX: tile.x,
        tileY: tile.y,
        offsetX: this.pickOffset(tile.x, tile.y, 337) * 0.82,
        offsetY: this.pickOffset(tile.x, tile.y, 353) * 0.82,
        frameIndex: this.pickPropFrame(tile.x, tile.y, assetKey, edge, grove, landmark, blend.forest),
        scale: this.pickPropScale(tile.x, tile.y, assetKey),
      });
    }

    return props;
  }

  private addEdgeBrushDecals(
    decals: TileDecalData[],
    id: number,
    tile: TileData,
    edge: number,
    dirt: number
  ): number {
    if (edge <= 0.58 || hash(tile.x, tile.y, 137) % 100 >= 18) return id;

    const dirtDominant = dirt > 0.42;
    decals.push({
      id: id++,
      assetKey: 'path_decals',
      tileX: tile.x,
      tileY: tile.y,
      offsetX: this.pickOffset(tile.x, tile.y, 139) * 0.56,
      offsetY: this.pickOffset(tile.x, tile.y, 141) * 0.56,
      frameIndex: this.pickBrushFrame(tile.x, tile.y, dirtDominant),
      scale: 0.64 + (hash(tile.x, tile.y, 143) % 11) / 100,
      alpha: 0.62 + edge * 0.22,
      tint: dirtDominant ? '#d7a66f' : '#d2bf80',
    });

    if (edge > 0.72 && hash(tile.x, tile.y, 151) % 100 < 44) {
      decals.push({
        id: id++,
        assetKey: 'meadow_decals',
        tileX: tile.x,
        tileY: tile.y,
        offsetX: this.pickOffset(tile.x, tile.y, 153) * 0.68,
        offsetY: this.pickOffset(tile.x, tile.y, 157) * 0.68,
        frameIndex: 16 + (hash(tile.x, tile.y, 159) % 16),
        scale: 0.92 + (hash(tile.x, tile.y, 161) % 12) / 100,
        alpha: 0.74,
        tint: '#c7d982',
      });
    }

    return id;
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
    assetKey: string,
    edge: number,
    grove: number,
    landmark: number,
    forest: number
  ): number {
    const roll = hash(x, y, 379) % 100;

    if (assetKey === 'shrub_props') {
      if (forest > 0.35 || grove > 0.55) return this.pickShrubGroundFrame(x, y, 395);
      return roll < 48 ? this.pickShrubGroundFrame(x, y, 399) : this.pickShrubGroundFrame(x, y, 401);
    }

    if (landmark > 0.66 && roll < 48) return 8 + (hash(x, y, 381) % 8);
    if (forest > 0.45 || grove > 0.64) return 4 + (hash(x, y, 397) % 12);
    if (edge > 0.5) return hash(x, y, 389) % 12;
    return hash(x, y, 386) % 16;
  }

  private getPropChance(
    edge: number,
    grove: number,
    landmark: number,
    forest: number,
    canopy: number,
    meadowCore: number
  ): number {
    const wall = Math.max(0, landmark - 0.56) * 80;
    const calm = 1 - meadowCore * 0.78;
    if (canopy > 0.52) return 70 + canopy * 52 + forest * 28;
    if (forest > 0.5) return 82 + grove * 34 + landmark * 12;
    if (forest > 0.28) return 64 + grove * 30 + landmark * 10;
    if (grove > 0.34) return 58 + grove * 34 + landmark * 8;
    if (forest > 0.15) return 44 + grove * 24 + landmark * 8;
    return (16 + edge * 52 + grove * 58 + landmark * 48 + forest * 32 + wall) * calm;
  }

  private getDecalChance(
    dirt: number,
    forest: number,
    flowerCluster: number,
    grassCluster: number,
    forestCluster: number,
    edge: number,
    meadowCore: number
  ): number {
    const base = 18 + flowerCluster * 145 + grassCluster * 82 + edge * 108;
    const terrainBoost = forest > 0.36 ? 115 + forestCluster * 132 : 0;
    const pathBoost = dirt > 0.38 ? 76 : 0;
    return (base + terrainBoost + pathBoost) * (1 - meadowCore * 0.58);
  }

  private pickDecalAtlas(x: number, y: number, dirt: number, forest: number, edge: number): string {
    const roll = hash(x, y, 149) % 100;

    if (forest > 0.42 && roll < 78) return 'forest_decals';
    if ((dirt > 0.36 || edge > 0.52) && roll < 70) return 'path_decals';
    return 'meadow_decals';
  }

  private pickPropAtlas(
    x: number,
    y: number,
    edge: number,
    grove: number,
    landmark: number,
    forest: number,
    canopy: number
  ): string {
    const roll = hash(x, y, 384) % 100;

    if (canopy > 0.56 && roll < 82) return 'shrub_props';
    if (forest > 0.5 && roll < 78) return 'shrub_props';
    if (forest > 0.28 && roll < 70) return 'shrub_props';
    if (grove > 0.34 && roll < 62) return 'shrub_props';
    if (forest > 0.15 && roll < 58) return 'shrub_props';
    if (grove > 0.58 && roll < 62) return 'shrub_props';
    if (edge > 0.48 && roll < 44) return 'rock_props';
    if (landmark > 0.56 && roll < 52) return 'rock_props';
    return roll < 62 ? 'shrub_props' : 'rock_props';
  }

  private pickPropScale(x: number, y: number, assetKey: string): number {
    const variance = (hash(x, y, 367) % 9) / 100;

    if (assetKey === 'shrub_props') return 0.9 + variance;
    return 0.95 + variance;
  }

  private pickShrubGroundFrame(x: number, y: number, seed: number): number {
    return SHRUB_GROUND_FRAMES[hash(x, y, seed) % SHRUB_GROUND_FRAMES.length];
  }

  private pickBrushFrame(x: number, y: number, dirtDominant: boolean): number {
    const base = dirtDominant ? 16 : 8;
    return base + (hash(x, y, 146) % 8);
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
