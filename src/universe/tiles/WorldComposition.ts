import { hash, smoothstep } from './TileRandom';

interface EllipseMask {
  readonly x: number;
  readonly y: number;
  readonly rx: number;
  readonly ry: number;
}

interface SegmentMask {
  readonly ax: number;
  readonly ay: number;
  readonly bx: number;
  readonly by: number;
  readonly width: number;
}

export class WorldComposition {
  private readonly clearings: EllipseMask[];
  private readonly meadowCore: EllipseMask;
  private readonly roads: SegmentMask[];
  private readonly walls: SegmentMask[];

  constructor(
    private readonly width: number,
    private readonly height: number
  ) {
    this.meadowCore = { x: width * 0.5, y: height * 0.52, rx: width * 0.3, ry: height * 0.22 };
    this.clearings = [
      this.meadowCore,
      { x: width * 0.24, y: height * 0.33, rx: width * 0.14, ry: height * 0.09 },
      { x: width * 0.72, y: height * 0.66, rx: width * 0.12, ry: height * 0.08 },
    ];
    this.roads = [
      { ax: width * 0.1, ay: height * 0.58, bx: width * 0.52, by: height * 0.42, width: 1.16 },
      { ax: width * 0.52, ay: height * 0.42, bx: width * 0.88, by: height * 0.28, width: 0.94 },
      { ax: width * 0.52, ay: height * 0.42, bx: width * 0.72, by: height * 0.7, width: 0.92 },
      { ax: width * 0.28, ay: height * 0.24, bx: width * 0.52, by: height * 0.42, width: 0.86 },
      { ax: width * 0.34, ay: height * 0.78, bx: width * 0.72, by: height * 0.7, width: 0.84 },
    ];
    this.walls = [
      { ax: width * 0.16, ay: height * 0.25, bx: width * 0.34, by: height * 0.2, width: 0.62 },
      { ax: width * 0.58, ay: height * 0.58, bx: width * 0.78, by: height * 0.62, width: 0.62 },
      { ax: width * 0.2, ay: height * 0.72, bx: width * 0.42, by: height * 0.82, width: 0.58 },
    ];
  }

  getClearingMask(x: number, y: number): number {
    return this.maxEllipseMask(x, y, this.clearings);
  }

  getMeadowCoreMask(x: number, y: number): number {
    return this.ellipseMask(x, y, this.meadowCore);
  }

  getRoadMask(x: number, y: number): number {
    return this.maxSegmentMask(x, y, this.roads, 23);
  }

  getRoadEdgeMask(x: number, y: number): number {
    const road = this.getRoadMask(x, y);
    return 1 - Math.min(1, Math.abs(road - 0.42) / 0.42);
  }

  getDirtWearMask(x: number, y: number): number {
    return Math.max(this.getRoadMask(x, y), this.getBaseDirtWearMask(x, y));
  }

  getBaseDirtWearMask(x: number, y: number): number {
    const clearing = this.getClearingMask(x, y);
    const noise = this.valueNoise(x * 0.32, y * 0.32, 41);
    const center = this.ellipseMask(x, y, this.meadowCore);
    return clearing * (0.12 + noise * 0.16) * (1 - center * 0.36);
  }

  getVegetationMask(x: number, y: number): number {
    const clearing = this.getClearingMask(x, y);
    const roadEdge = this.getRoadEdgeMask(x, y);
    const clusters = this.clusterMask(x, y, 607, 10, 2.8, 0.72);
    const forestEdge = this.getForestEdgeMask(x, y);
    return Math.max(roadEdge * 0.64, forestEdge * 0.82, clusters * (1 - clearing * 0.58));
  }

  getRockMask(x: number, y: number): number {
    const walls = this.getWallMask(x, y);
    const forestEdge = this.getForestEdgeMask(x, y);
    const clusters = this.clusterMask(x, y, 811, 7, 3.2, 0.62);
    return Math.max(walls * 0.72, forestEdge * 0.7, clusters * forestEdge * 0.86);
  }

  getWallMask(x: number, y: number): number {
    return this.maxSegmentMask(x, y, this.walls, 59);
  }

  getForestMask(x: number, y: number): number {
    const edge = this.getMapEdgeMask(x, y);
    const clumps = this.clusterMask(x, y, 1013, 14, 5.8, 0.74);
    const ring = this.ellipseBandMask(x, y, this.meadowCore, 0.88, 1.42);
    const clearing = this.getClearingMask(x, y);
    const core = this.ellipseMask(x, y, this.meadowCore);
    const brokenEdge = Math.max(edge, ring, clumps * 0.78);
    const suppression = Math.max(clearing * 0.42, core);

    return Math.max(0, Math.min(1, brokenEdge * (1 - suppression * 0.86)));
  }

  getForestEdgeMask(x: number, y: number): number {
    const forest = this.getForestMask(x, y);
    return 1 - Math.min(1, Math.abs(forest - 0.36) / 0.36);
  }

  getWaterMask(_x: number, _y: number): number {
    return 0;
  }

  private maxEllipseMask(x: number, y: number, ellipses: readonly EllipseMask[]): number {
    let value = 0;

    for (const ellipse of ellipses) {
      value = Math.max(value, this.ellipseMask(x, y, ellipse));
    }

    return value;
  }

  private ellipseMask(x: number, y: number, ellipse: EllipseMask): number {
    const distance = this.ellipseDistance(x, y, ellipse);
    return 1 - smoothstep(0.62, 1.04, distance);
  }

  private ellipseBandMask(x: number, y: number, ellipse: EllipseMask, inner: number, outer: number): number {
    const distance = this.ellipseDistance(x, y, ellipse);
    const enters = smoothstep(inner, inner + 0.18, distance);
    const exits = 1 - smoothstep(outer - 0.18, outer, distance);
    const breakNoise = 0.72 + this.valueNoise(x * 0.2, y * 0.2, 1499) * 0.34;

    return Math.max(0, Math.min(1, enters * exits * breakNoise));
  }

  private ellipseDistance(x: number, y: number, ellipse: EllipseMask): number {
    const dx = (x - ellipse.x) / ellipse.rx;
    const dy = (y - ellipse.y) / ellipse.ry;
    const wobble =
      Math.sin(x * 0.58 + ellipse.y * 0.13) * 0.06 +
      Math.sin(y * 0.71 + ellipse.x * 0.19) * 0.05;

    return Math.sqrt(dx * dx + dy * dy) + wobble;
  }

  private getMapEdgeMask(x: number, y: number): number {
    const edgeDistance = Math.min(x, y, this.width - 1 - x, this.height - 1 - y);
    const edge = 1 - smoothstep(7, 20, edgeDistance);
    const corner = this.clusterMask(x, y, 1291, 9, 8.8, 0.8);

    return Math.max(edge, corner * 0.7);
  }

  private maxSegmentMask(x: number, y: number, segments: readonly SegmentMask[], seed: number): number {
    let value = 0;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const wobble =
        Math.sin(x * 0.63 + i * 1.7) * 0.08 +
        Math.sin(y * 0.51 + seed * 0.17) * 0.06;
      const distance = this.segmentDistance(x, y, segment.ax, segment.ay, segment.bx, segment.by) + wobble;
      value = Math.max(value, 1 - smoothstep(segment.width * 0.42, segment.width, distance));
    }

    return value;
  }

  private clusterMask(
    x: number,
    y: number,
    seed: number,
    count: number,
    radius: number,
    yScale: number
  ): number {
    let value = 0;

    for (let i = 0; i < count; i++) {
      const centerX = (hash(i, seed, 11) % (this.width * 100)) / 100;
      const centerY = (hash(i, seed, 17) % (this.height * 100)) / 100;
      const r = radius + (hash(i, seed, 23) % 38) / 10;
      const dx = (x - centerX) / r;
      const dy = (y - centerY) / (r * yScale);
      value = Math.max(value, 1 - smoothstep(0.22, 1, Math.sqrt(dx * dx + dy * dy)));
    }

    return value;
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

  private valueNoise(x: number, y: number, seed: number): number {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const xBlend = this.fade(x - x0);
    const yBlend = this.fade(y - y0);
    const a = hash(x0, y0, seed) / 0xffffffff;
    const b = hash(x0 + 1, y0, seed) / 0xffffffff;
    const c = hash(x0, y0 + 1, seed) / 0xffffffff;
    const d = hash(x0 + 1, y0 + 1, seed) / 0xffffffff;

    return this.lerp(this.lerp(a, b, xBlend), this.lerp(c, d, xBlend), yBlend);
  }

  private fade(value: number): number {
    return value * value * (3 - 2 * value);
  }

  private lerp(a: number, b: number, blend: number): number {
    return a + (b - a) * blend;
  }
}
