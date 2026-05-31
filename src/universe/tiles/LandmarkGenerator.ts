import type { TileOccluderData } from './TileData';
import type { TerrainGenerator } from './TerrainGenerator';
import { hash } from './TileRandom';

interface LandmarkPlacement {
  readonly x: number;
  readonly y: number;
  readonly frameIndex: number;
  readonly scale: number;
}

export class LandmarkGenerator {
  constructor(
    private readonly width: number,
    private readonly height: number,
    private readonly terrain: TerrainGenerator
  ) {}

  createLandmarks(idOffset = 0): TileOccluderData[] {
    return this.getPlacements().map((placement, index) => {
      const spot = this.findBuildableSpot(
        Math.round(this.width * placement.x),
        Math.round(this.height * placement.y)
      );

      return {
        id: idOffset + index,
        assetKey: 'landmarks',
        tileX: spot.x,
        tileY: spot.y,
        offsetX: this.pickOffset(spot.x, spot.y, 131 + index * 7),
        offsetY: this.pickOffset(spot.x, spot.y, 139 + index * 11) * 0.6,
        frameIndex: placement.frameIndex,
        scale: placement.scale,
        shadowScale: 1.35,
        depthBias: 0.45,
      };
    });
  }

  private getPlacements(): LandmarkPlacement[] {
    return [
      { x: 0.18, y: 0.22, frameIndex: 0, scale: 1.02 },
      { x: 0.34, y: 0.18, frameIndex: 1, scale: 1.04 },
      { x: 0.50, y: 0.30, frameIndex: 2, scale: 1.0 },
      { x: 0.68, y: 0.24, frameIndex: 3, scale: 1.0 },
      { x: 0.82, y: 0.36, frameIndex: 5, scale: 1.02 },
      { x: 0.22, y: 0.52, frameIndex: 6, scale: 0.96 },
      { x: 0.42, y: 0.58, frameIndex: 7, scale: 1.0 },
      { x: 0.62, y: 0.66, frameIndex: 8, scale: 0.98 },
      { x: 0.78, y: 0.72, frameIndex: 9, scale: 1.0 },
      { x: 0.30, y: 0.78, frameIndex: 10, scale: 1.0 },
      { x: 0.56, y: 0.84, frameIndex: 11, scale: 1.05 },
    ];
  }

  private findBuildableSpot(targetX: number, targetY: number): { x: number; y: number } {
    let best = this.clampSpot(targetX, targetY);
    let bestScore = Number.POSITIVE_INFINITY;

    for (let radius = 0; radius <= 8; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const spot = this.clampSpot(targetX + dx, targetY + dy);
          const blend = this.terrain.getTerrainBlend(spot.x, spot.y);
          const blocked = blend.water > 0.22 || blend.forest > 0.65;
          if (blocked) continue;

          const roadBonus = blend.cobblestone * 2.5 + blend.dirt * 0.65;
          const distance = Math.abs(dx) + Math.abs(dy);
          const score = distance - roadBonus;
          if (score < bestScore) {
            best = spot;
            bestScore = score;
          }
        }
      }
      if (bestScore < Number.POSITIVE_INFINITY) return best;
    }

    return best;
  }

  private clampSpot(x: number, y: number): { x: number; y: number } {
    return {
      x: Math.max(2, Math.min(this.width - 3, x)),
      y: Math.max(2, Math.min(this.height - 3, y)),
    };
  }

  private pickOffset(x: number, y: number, seed: number): number {
    return (hash(x, y, seed) % 38) / 100 - 0.19;
  }
}
