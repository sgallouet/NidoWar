import type { IRenderer } from './IRenderer';
import type { SpriteDrawOptions } from './IRenderer';

/**
 * Minimal 2D Canvas renderer for early proofs.
 * Later replaced (or wrapped) by a Pixi-based implementation behind the same interface.
 */
export class Canvas2DRenderer implements IRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private readonly resizeHandler = () => this.resizeCanvas();

  private ensureContext(): void {
    if (this.ctx) return;

    // Self-contained: create our own canvas if none exists (post main.ts cleanup)
    let el = document.getElementById('game') as HTMLCanvasElement | null;

    if (!el) {
      el = document.createElement('canvas');
      el.id = 'game';
      el.style.cssText = 'display:block; width:100vw; height:100vh; image-rendering:pixelated;';

      const container = document.getElementById('app') || document.body;
      // Hide any previous Pixi canvas for clean switching in dev
      const oldPixi = container.querySelector('canvas:not(#game)');
      if (oldPixi) (oldPixi as HTMLCanvasElement).style.display = 'none';

      container.appendChild(el);
    }

    this.canvas = el;
    this.ctx = el.getContext('2d', { alpha: true });
    if (!this.ctx) {
      throw new Error('[Renderer] Failed to get 2D context');
    }

    // Basic setup for crisp pixel art later
    this.ctx.imageSmoothingEnabled = false;
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeHandler);
  }

  clear(): void {
    this.ensureContext();
    this.resizeCanvas();
    const ctx = this.ctx!;
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, this.canvas!.width, this.canvas!.height);
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.ctx) return;

    const nextWidth = Math.max(1, Math.floor(window.innerWidth));
    const nextHeight = Math.max(1, Math.floor(window.innerHeight));
    if (this.canvas.width === nextWidth && this.canvas.height === nextHeight) {
      return;
    }

    this.canvas.width = nextWidth;
    this.canvas.height = nextHeight;
    this.ctx.imageSmoothingEnabled = false;
  }

  /** Returns the canvas this renderer owns (created on first draw if needed). */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  drawTile(worldX: number, worldY: number, color: string): void {
    this.ensureContext();
    const ctx = this.ctx!;

    // Very simple diamond shape as a stand-in for an isometric tile.
    // Real isometric math + projection will live in engine/isometric later.
    const size = 32;
    const cx = worldX;
    const cy = worldY;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 0.5);           // top
    ctx.lineTo(cx + size, cy);                 // right
    ctx.lineTo(cx, cy + size * 0.5);           // bottom
    ctx.lineTo(cx - size, cy);                 // left
    ctx.closePath();
    ctx.fill();

    // Light border for clarity
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawSprite(options: SpriteDrawOptions): void {
    this.ensureContext();
    const ctx = this.ctx!;
    const frame = options.manifest.frames[options.frameIndex ?? 0];
    const scale = options.manifest.scale * (options.scale ?? 1);

    ctx.drawImage(
      options.image,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      Math.round(options.screenX - frame.center.x * scale),
      Math.round(options.screenY - frame.center.y * scale),
      frame.w * scale,
      frame.h * scale
    );
  }

  present(): void {
    // For pure Canvas2D this is a no-op (draw calls are immediate).
    // Pixi adapter will call app.renderer.render(...) here.
  }
}
