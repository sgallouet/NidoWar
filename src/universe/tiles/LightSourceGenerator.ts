import type { TileLightData } from './TileData';
import { hash } from './TileRandom';

export class LightSourceGenerator {
  constructor(
    private readonly width: number,
    private readonly height: number
  ) {}

  createTorches(): TileLightData[] {
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
      offsetX: ((hash(position.x, position.y, 431) % 34) / 100) - 0.17,
      offsetY: ((hash(position.x, position.y, 439) % 34) / 100) - 0.17,
      radius: 155 + (hash(position.x, position.y, 443) % 35),
      intensity: 0.72 + (hash(position.x, position.y, 449) % 12) / 100,
      color: '#ffb04d',
    }));
  }
}
