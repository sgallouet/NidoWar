import type { TerrainType } from './TileData';
import { createTerrainBlend, type TerrainBlend } from './TerrainMaterial';

interface DirtPatch {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

export class TerrainGenerator {
  private readonly patches: DirtPatch[];

  constructor(
    private readonly width: number,
    private readonly height: number
  ) {
    this.patches = [
      { x: width * 0.26, y: height * 0.26, rx: 7.5, ry: 5.5 },
      { x: width * 0.62, y: height * 0.38, rx: 8.5, ry: 6.0 },
      { x: width * 0.42, y: height * 0.72, rx: 6.5, ry: 4.5 },
    ];
  }

  pickTerrain(x: number, y: number, fallback: TerrainType): TerrainType {
    if (fallback !== 'grass') return fallback;

    const blend = this.getTerrainBlend(x, y);
    if (blend.water > 0.52) return 'water';
    if (blend.forest > 0.5) return 'forest';
    return this.getDirtBlend(x, y) > 0.52 ? 'dirt' : 'grass';
  }

  getTerrainBlend(x: number, y: number): TerrainBlend {
    const dirt = this.getDirtBlend(x, y);
    const road = this.getRoadBlend(x, y);
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

  getDirtBlend(x: number, y: number): number {
    let blend = 0;

    for (const patch of this.patches) {
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

  getDirtEdge(x: number, y: number): number {
    const dirt = this.getDirtBlend(x, y);
    return 1 - Math.min(1, Math.abs(dirt - 0.38) / 0.38);
  }

  getRoadBlend(x: number, y: number): number {
    const spine = this.segmentDistance(x, y, this.width * 0.08, this.height * 0.56, this.width * 0.88, this.height * 0.24);
    const branch = this.segmentDistance(x, y, this.width * 0.36, this.height * 0.2, this.width * 0.68, this.height * 0.84);
    const center = this.segmentDistance(x, y, this.width * 0.12, this.height * 0.16, this.width * 0.86, this.height * 0.78);
    const distance = Math.min(spine, branch, center);
    const wobble = Math.sin(x * 0.77 + y * 0.31) * 0.12 + Math.sin(y * 1.21) * 0.08;

    return 1 - this.smoothstep(0.42, 1.18, distance + wobble);
  }

  getForestBlend(x: number, y: number): number {
    const north = this.ellipseBlend(x, y, this.width * 0.26, this.height * 0.16, this.width * 0.16, this.height * 0.12);
    const east = this.ellipseBlend(x, y, this.width * 0.78, this.height * 0.38, this.width * 0.16, this.height * 0.2);
    const south = this.ellipseBlend(x, y, this.width * 0.56, this.height * 0.86, this.width * 0.24, this.height * 0.14);
    const noise = Math.sin(x * 0.91 + y * 0.37) * 0.08 + Math.sin(y * 1.73) * 0.06;

    return Math.max(0, Math.min(1, Math.max(north, east, south) + noise));
  }

  getWaterBlend(x: number, y: number): number {
    const lake = this.ellipseBlend(x, y, this.width * 0.08, this.height * 0.1, this.width * 0.18, this.height * 0.12);
    const pond = this.ellipseBlend(x, y, this.width * 0.9, this.height * 0.88, this.width * 0.14, this.height * 0.1);

    return Math.max(lake, pond);
  }

  private ellipseBlend(x: number, y: number, cx: number, cy: number, rx: number, ry: number): number {
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return 1 - this.smoothstep(0.68, 1.08, Math.sqrt(dx * dx + dy * dy));
  }

  private segmentDistance(x: number, y: number, ax: number, ay: number, bx: number, by: number): number {
    const vx = bx - ax;
    const vy = by - ay;
    const lengthSq = vx * vx + vy * vy;
    const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / lengthSq));
    const px = ax + vx * t;
    const py = ay + vy * t;
    const dx = x - px;
    const dy = y - py;

    return Math.sqrt(dx * dx + dy * dy);
  }

  private smoothstep(edge0: number, edge1: number, value: number): number {
    const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return amount * amount * (3 - 2 * amount);
  }
}
