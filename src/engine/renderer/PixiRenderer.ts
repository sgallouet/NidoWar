/**
 * PixiJS v8 adapter implementing IRenderer.
 * Keeps display objects pooled by render layer so camera movement does not
 * allocate hundreds of sprites every frame.
 * The rest of the engine (IsometricRenderer, TileView, etc.) remains unaware of Pixi.
 */

import { Application, Color, Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import type { IRenderer } from './IRenderer';
import type {
  ImageDrawOptions,
  RadialLightDrawOptions,
  RenderLayer,
  RenderStats,
  SpriteDrawOptions,
} from './IRenderer';

export class PixiRenderer implements IRenderer {
  private app!: Application;
  private ready: Promise<void>;
  private readonly layers: Record<RenderLayer, Container> = {
    terrain: new Container(),
    decal: new Container(),
    prop: new Container(),
    unit: new Container(),
    lighting: new Container(),
  };
  private graphics = new Graphics();
  private lightingOverlay = new Graphics();
  private textureCache = new Map<string, Texture>();
  private lightTextureCache = new Map<string, Texture>();
  private imageTextureCache = new Map<string, Texture>();
  private spritePools = new Map<string, Sprite[]>();
  private poolCursors = new Map<string, number>();
  private stats: RenderStats = {
    drawCalls: 0,
    visibleSprites: 0,
    pooledSprites: 0,
    stageChildren: 0,
  };

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

    this.layers.terrain.addChild(this.graphics);
    this.layers.lighting.addChild(this.lightingOverlay);
    this.app.stage.addChild(
      this.layers.terrain,
      this.layers.decal,
      this.layers.prop,
      this.layers.unit,
      this.layers.lighting
    );
    window.addEventListener('resize', () => this.resize());
  }

  async waitReady(): Promise<void> {
    return this.ready;
  }

  clear(): void {
    this.resize();
    this.resetStats();
    this.poolCursors.clear();
    this.graphics.clear();
    this.lightingOverlay.clear();
    this.hidePooledSprites();
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
    this.stats.drawCalls++;
  }

  drawImage(options: ImageDrawOptions): void {
    const layer = options.layer ?? 'terrain';
    const key = `${layer}:image:${this.getImageKey(options.image)}`;
    const sprite = this.getPooledSprite(layer, key);

    sprite.texture = this.getImageTexture(options.image);
    sprite.anchor.set(0);
    sprite.position.set(Math.round(options.screenX), Math.round(options.screenY));
    sprite.scale.set(options.scale ?? 1);
    this.countSpriteDraw();
  }

  drawSprite(options: SpriteDrawOptions): void {
    const layer = options.layer ?? 'prop';
    const frame = options.manifest.frames[options.frameIndex ?? 0];
    const scale = options.manifest.scale * (options.scale ?? 1);
    const key = `${layer}:sprite:${this.getFrameTextureKey(options)}`;
    const sprite = this.getPooledSprite(layer, key);

    sprite.texture = this.getFrameTexture(options);
    sprite.anchor.set(frame.center.x / frame.w, frame.center.y / frame.h);
    sprite.position.set(Math.round(options.screenX), Math.round(options.screenY));
    sprite.scale.set(scale);
    this.countSpriteDraw();
  }

  drawNightLighting(ambientColor: string, ambientAlpha: number, lights: RadialLightDrawOptions[]): void {
    this.lightingOverlay.clear();
    this.lightingOverlay.rect(0, 0, this.app.renderer.width, this.app.renderer.height);
    this.lightingOverlay.fill({ color: this.parseColor(ambientColor), alpha: ambientAlpha });
    this.stats.drawCalls++;

    for (const light of lights) {
      const key = `lighting:light:${light.color}`;
      const sprite = this.getPooledSprite('lighting', key);
      const diameter = light.radius * 2;

      sprite.texture = this.getLightTexture(light.color);
      sprite.anchor.set(0.5);
      sprite.position.set(Math.round(light.screenX), Math.round(light.screenY));
      sprite.width = diameter;
      sprite.height = diameter;
      sprite.alpha = light.intensity;
      sprite.blendMode = 'add';
      this.countSpriteDraw();
    }
  }

  getRenderStats(): RenderStats {
    let pooledSprites = 0;
    for (const sprites of this.spritePools.values()) {
      pooledSprites += sprites.length;
    }

    return {
      ...this.stats,
      pooledSprites,
      stageChildren: this.app.stage.children.length,
    };
  }

  private getFrameTexture(options: SpriteDrawOptions): Texture {
    const key = this.getFrameTextureKey(options);
    const cached = this.textureCache.get(key);
    if (cached) return cached;

    const frameIndex = options.frameIndex ?? 0;
    const frame = options.manifest.frames[frameIndex];
    const base = Texture.from(options.image);
    const texture = new Texture({
      source: base.source,
      frame: new Rectangle(frame.x, frame.y, frame.w, frame.h),
      orig: new Rectangle(0, 0, frame.w, frame.h),
    });

    this.textureCache.set(key, texture);
    return texture;
  }

  private getFrameTextureKey(options: SpriteDrawOptions): string {
    const frameIndex = options.frameIndex ?? 0;
    const frame = options.manifest.frames[frameIndex];
    return `${options.image.src}:${frameIndex}:${frame.x},${frame.y},${frame.w},${frame.h}`;
  }

  private getImageTexture(image: HTMLImageElement | HTMLCanvasElement): Texture {
    const key = this.getImageKey(image);
    const cached = this.imageTextureCache.get(key);
    if (cached) return cached;

    const texture = Texture.from(image);
    this.imageTextureCache.set(key, texture);
    return texture;
  }

  private getImageKey(image: HTMLImageElement | HTMLCanvasElement): string {
    if (image instanceof HTMLImageElement) {
      return image.src;
    }

    return `canvas:${image.width}x${image.height}`;
  }

  private getPooledSprite(layer: RenderLayer, key: string): Sprite {
    const cursor = this.poolCursors.get(key) ?? 0;
    const pool = this.spritePools.get(key) ?? [];
    let sprite = pool[cursor];

    if (!sprite) {
      sprite = new Sprite({ roundPixels: true });
      pool.push(sprite);
      this.spritePools.set(key, pool);
      this.layers[layer].addChild(sprite);
    }

    sprite.visible = true;
    sprite.alpha = 1;
    sprite.blendMode = 'normal';
    this.poolCursors.set(key, cursor + 1);
    return sprite;
  }

  private hidePooledSprites(): void {
    for (const sprites of this.spritePools.values()) {
      for (const sprite of sprites) {
        sprite.visible = false;
      }
    }
  }

  private countSpriteDraw(): void {
    this.stats.drawCalls++;
    this.stats.visibleSprites++;
  }

  private resetStats(): void {
    this.stats = {
      drawCalls: 0,
      visibleSprites: 0,
      pooledSprites: 0,
      stageChildren: this.app.stage.children.length,
    };
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
