import type { TerrainType } from './TileData';
import { createTerrainBlend, type TerrainBlend } from './TerrainMaterial';
import type { WorldComposition } from './WorldComposition';

interface DirtPatch {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

export class TerrainGenerator {
  private readonly patches: DirtPatch[];

  constructor(
    width: number,
    height: number,
    private readonly composition: WorldComposition
  ) {
    this.patches = [
      { x: width * 0.28, y: height * 0.36, rx: 8.4, ry: 5.8 },
      { x: width * 0.58, y: height * 0.48, rx: 9.2, ry: 6.4 },
      { x: width * 0.44, y: height * 0.68, rx: 7.2, ry: 5.0 },
    ];
  }

  pickTerrain(x: number, y: number, fallback: TerrainType): TerrainType {
    if (fallback !== 'grass') return fallback;

    const blend = this.getTerrainBlend(x, y);
    if (blend.water > 0.52) return 'water';
    if (blend.forest > 0.5) return 'forest';
    return this.getDirtBlend(x, y) > 0.52 ? 'dirt' : 'grass';
  }

  getTerrainBlend(x: number, y: number, includeRoads = true): TerrainBlend {
    const dirt = this.getDirtBlend(x, y, includeRoads);
    const road = includeRoads ? this.getRoadBlend(x, y) : 0;
    const forest = this.getForestBlend(x, y);
    const water = this.getWaterBlend(x, y);
    const occupied = Math.min(0.95, water * 0.9 + forest * 0.62 + road * 0.78 + dirt * 0.68);

    return createTerrainBlend({
      grass: Math.max(0.05, 1 - occupied),
      dirt: dirt * (1 - road * 0.65) * (1 - water),
      cobblestone: road * (1 - water),
      forest: forest * (1 - water * 0.75),
      water,
    });
  }

  getDirtBlend(x: number, y: number, includeRoads = true): number {
    let blend = includeRoads
      ? this.composition.getDirtWearMask(x, y)
      : this.composition.getBaseDirtWearMask(x, y);

    for (const patch of this.patches) {
      const dx = (x - patch.x) / patch.rx;
      const dy = (y - patch.y) / patch.ry;
      const wobble =
        Math.sin(x * 1.13 + patch.y * 0.41) * 0.055 +
        Math.sin(y * 1.47 + patch.x * 0.33) * 0.045;
      const distance = Math.sqrt(dx * dx + dy * dy) + wobble;
      blend = Math.max(blend, (1 - this.smoothstep(0.62, 1.12, distance)) * 0.34);
    }

    return Math.max(0, Math.min(1, blend));
  }

  getDirtEdge(x: number, y: number): number {
    const dirt = this.getDirtBlend(x, y);
    return 1 - Math.min(1, Math.abs(dirt - 0.38) / 0.38);
  }

  getRoadBlend(x: number, y: number): number {
    return this.composition.getRoadMask(x, y);
  }

  getForestBlend(x: number, y: number): number {
    return this.composition.getForestMask(x, y);
  }

  getWaterBlend(x: number, y: number): number {
    return this.composition.getWaterMask(x, y);
  }

  private smoothstep(edge0: number, edge1: number, value: number): number {
    const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return amount * amount * (3 - 2 * amount);
  }
}
