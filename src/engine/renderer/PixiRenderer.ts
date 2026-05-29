/**
 * Minimal PixiJS v8 adapter implementing IRenderer.
 * Uses Graphics for placeholder diamonds in the 1.4 proof.
 * The rest of the engine (IsometricRenderer, TileView, etc.) remains unaware of Pixi.
 */

import { Application, Graphics, Color, Rectangle, Sprite, Texture } from 'pixi.js';
import type { IRenderer } from './IRenderer';
import type { ImageDrawOptions, RadialLightDrawOptions, SpriteDrawOptions } from './IRenderer';

export class PixiRenderer implements IRenderer {
  private app!: Application;
  private ready: Promise<void>;
  private graphics = new Graphics();
  private textureCache = new Map<string, Texture>();
  private lightTextureCache = new Map<string, Texture>();

  constructor() {
    this.app = new Application();
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    await this.app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x0a0a0c,
      antialias: false,
      resolution: 1,
    });

    // Append Pixi's canvas to the same container as the dev proof
    const container = document.getElementById('app');
    if (container) {
      container.appendChild(this.app.canvas);
      this.app.canvas.style.cssText = 'display:block; width:100vw; height:100vh; image-rendering:pixelated;';
      // Hide any previous canvas for clean switching in dev
      const oldCanvas = document.getElementById('game') as HTMLCanvasElement | null;
      if (oldCanvas) oldCanvas.style.display = 'none';
    }

    this.app.stage.addChild(this.graphics);
    window.addEventListener('resize', () => this.resize());
  }

  async waitReady(): Promise<void> {
    return this.ready;
  }

  clear(): void {
    this.resize();
    // Non-blocking clear; if not ready yet the next draw will handle
    this.graphics.clear();
    // Also clear any other children added in future
    while (this.app.stage.children.length > 1) {
      this.app.stage.removeChildAt(1);
    }
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.app?.canvas ?? null;
  }

  drawTile(screenX: number, screenY: number, color: string): void {
    // Draw a diamond placeholder matching the Canvas proof style
    const size = 32;
    const cx = screenX;
    const cy = screenY;

    const hex = color.startsWith('#') ? parseInt(color.slice(1), 16) : 0x4a7c3a;
    const col = new Color(hex);

    this.graphics.moveTo(cx, cy - size * 0.5);
    this.graphics.lineTo(cx + size, cy);
    this.graphics.lineTo(cx, cy + size * 0.5);
    this.graphics.lineTo(cx - size, cy);
    this.graphics.closePath();
    this.graphics.fill(col);

    // Light border
    this.graphics.stroke({ color: 0x1a1a1a, width: 1 });
  }

  drawImage(options: ImageDrawOptions): void {
    const sprite = new Sprite({
      texture: Texture.from(options.image),
      roundPixels: true,
    });

    sprite.position.set(Math.round(options.screenX), Math.round(options.screenY));
    sprite.scale.set(options.scale ?? 1);
    this.app.stage.addChild(sprite);
  }

  drawSprite(options: SpriteDrawOptions): void {
    const frame = options.manifest.frames[options.frameIndex ?? 0];
    const scale = options.manifest.scale * (options.scale ?? 1);
    const sprite = new Sprite({
      texture: this.getFrameTexture(options),
      anchor: {
        x: frame.center.x / frame.w,
        y: frame.center.y / frame.h,
      },
      roundPixels: true,
    });

    sprite.position.set(Math.round(options.screenX), Math.round(options.screenY));
    sprite.scale.set(scale);
    this.app.stage.addChild(sprite);
  }

  drawNightLighting(ambientColor: string, ambientAlpha: number, lights: RadialLightDrawOptions[]): void {
    const overlay = new Graphics();
    overlay.rect(0, 0, this.app.renderer.width, this.app.renderer.height);
    overlay.fill({ color: this.parseColor(ambientColor), alpha: ambientAlpha });
    this.app.stage.addChild(overlay);

    for (const light of lights) {
      const sprite = new Sprite({
        texture: this.getLightTexture(light.color),
        anchor: 0.5,
        roundPixels: true,
      });

      const diameter = light.radius * 2;
      sprite.position.set(Math.round(light.screenX), Math.round(light.screenY));
      sprite.width = diameter;
      sprite.height = diameter;
      sprite.alpha = light.intensity;
      sprite.blendMode = 'add';
      this.app.stage.addChild(sprite);
    }
  }

  private getFrameTexture(options: SpriteDrawOptions): Texture {
    const frameIndex = options.frameIndex ?? 0;
    const frame = options.manifest.frames[frameIndex];
    const key = `${options.image.src}:${frameIndex}:${frame.x},${frame.y},${frame.w},${frame.h}`;
    const cached = this.textureCache.get(key);
    if (cached) return cached;

    const base = Texture.from(options.image);
    const texture = new Texture({
      source: base.source,
      frame: new Rectangle(frame.x, frame.y, frame.w, frame.h),
      orig: new Rectangle(0, 0, frame.w, frame.h),
    });

    this.textureCache.set(key, texture);
    return texture;
  }

  private getLightTexture(color: string): Texture {
    const cached = this.lightTextureCache.get(color);
    if (cached) return cached;

    const size = 96;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('[PixiRenderer] Failed to create light texture');

    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, this.hexToRgba(color, 1));
    gradient.addColorStop(0.18, this.hexToRgba('#fff1b8', 0.82));
    gradient.addColorStop(0.42, this.hexToRgba(color, 0.36));
    gradient.addColorStop(1, this.hexToRgba(color, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = Texture.from(canvas);
    this.lightTextureCache.set(color, texture);
    return texture;
  }

  private parseColor(hex: string): number {
    return parseInt(hex.replace('#', ''), 16);
  }

  private hexToRgba(hex: string, alpha: number): string {
    const value = this.parseColor(hex);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
  }

  private resize(): void {
    if (!this.app?.renderer) return;

    const width = Math.max(1, Math.floor(window.innerWidth));
    const height = Math.max(1, Math.floor(window.innerHeight));
    if (this.app.renderer.width === width && this.app.renderer.height === height) {
      return;
    }

    this.app.renderer.resize(width, height);
  }

  present(): void {
    // Pixi v8 renders automatically on next frame.
    // For explicit control we could call this.app.renderer.render(this.app.stage)
    // but it is unnecessary for this proof.
  }
}
