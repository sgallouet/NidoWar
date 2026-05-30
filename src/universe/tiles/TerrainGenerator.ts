import type { TerrainType } from './TileData';

interface DirtPatch {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

export class TerrainGenerator {
  private readonly patches: DirtPatch[];

  constructor(width: number, height: number) {
    this.patches = [
      { x: width * 0.26, y: height * 0.26, rx: 7.5, ry: 5.5 },
      { x: width * 0.62, y: height * 0.38, rx: 8.5, ry: 6.0 },
      { x: width * 0.42, y: height * 0.72, rx: 6.5, ry: 4.5 },
    ];
  }

  pickTerrain(x: number, y: number, fallback: TerrainType): TerrainType {
    if (fallback !== 'grass') return fallback;

    return this.getDirtBlend(x, y) > 0.52 ? 'dirt' : 'grass';
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

  private smoothstep(edge0: number, edge1: number, value: number): number {
    const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return amount * amount * (3 - 2 * amount);
  }
}
