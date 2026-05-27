/**
 * Minimal pointer drag input for the 1.5 panning proof.
 * Supports mouse and touch. Reports deltas in screen space.
 * Not a full input system — just enough for camera panning in this step.
 */

export interface PointerPoint {
  x: number;
  y: number;
}

export interface PointerInputHandlers {
  onDrag?: (deltaX: number, deltaY: number) => void;
  onZoom?: (factor: number, center: PointerPoint) => void;
  onTap?: (point: PointerPoint) => void;
}

export class PointerInput {
  private pointers = new Map<number, PointerPoint>();
  private tapStart: PointerPoint | null = null;
  private tapMoved = false;

  constructor(
    private readonly target: HTMLElement,
    private readonly handlers: PointerInputHandlers
  ) {
    this.attach();
  }

  private attach(): void {
    this.target.addEventListener('pointerdown', this.onDown);
    this.target.addEventListener('pointermove', this.onMove);
    this.target.addEventListener('pointerup', this.onUp);
    this.target.addEventListener('pointercancel', this.onUp);
    this.target.addEventListener('wheel', this.onWheel, { passive: false });
  }

  private onDown = (e: PointerEvent) => {
    const point = { x: e.clientX, y: e.clientY };
    this.pointers.set(e.pointerId, point);
    this.tapStart = point;
    this.tapMoved = false;
    this.target.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  private onMove = (e: PointerEvent) => {
    const previous = this.pointers.get(e.pointerId);
    if (!previous) return;

    const before = Array.from(this.pointers.values());
    const next = { x: e.clientX, y: e.clientY };
    this.pointers.set(e.pointerId, next);
    const after = Array.from(this.pointers.values());

    if (after.length === 1) {
      const dx = next.x - previous.x;
      const dy = next.y - previous.y;
      this.markMoved(dx, dy);
      this.handlers.onDrag?.(dx, dy);
    } else if (before.length >= 2 && after.length >= 2) {
      const oldDistance = this.distance(before[0], before[1]);
      const newDistance = this.distance(after[0], after[1]);
      if (oldDistance > 0) {
        this.handlers.onZoom?.(newDistance / oldDistance, this.midpoint(after[0], after[1]));
      }
      this.tapMoved = true;
    }

    e.preventDefault();
  };

  private onUp = (e: PointerEvent) => {
    const point = this.pointers.get(e.pointerId) ?? { x: e.clientX, y: e.clientY };
    this.pointers.delete(e.pointerId);

    if (this.pointers.size === 0 && this.tapStart && !this.tapMoved) {
      this.handlers.onTap?.(point);
    }

    this.tapStart = null;
    this.target.releasePointerCapture?.(e.pointerId);
  };

  private onWheel = (e: WheelEvent) => {
    const factor = Math.exp(-e.deltaY * 0.001);
    this.handlers.onZoom?.(factor, { x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  private markMoved(deltaX: number, deltaY: number): void {
    if (Math.hypot(deltaX, deltaY) > 4) {
      this.tapMoved = true;
    }
  }

  private distance(a: PointerPoint, b: PointerPoint): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  private midpoint(a: PointerPoint, b: PointerPoint): PointerPoint {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    };
  }
}
