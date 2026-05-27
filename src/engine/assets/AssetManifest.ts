/**
 * Types matching the mandatory JSON sprite manifest format (see docs/ART_SPEC.md).
 * These types are the single source of truth for all art data in the game.
 * Never hardcode frame coordinates or sizes in gameplay or rendering code.
 */

export interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FrameCenter {
  x: number;
  y: number;
}

export interface SpriteFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Duration in milliseconds. 0 or omitted = still frame. */
  duration?: number;
  /** Local pivot/center point inside the frame (in pixels). */
  center?: FrameCenter;
}

export interface SpriteManifest {
  name: string;
  /** Relative or absolute path to the source image (png, etc.). */
  image: string;
  /** Optional: common size for all frames if they are uniform. */
  frameSize?: { w: number; h: number };
  frames: SpriteFrame[];
  /** Global scale multiplier for this sprite. */
  scale?: number;
  /**
   * Normalized anchor (0-1) used for world placement.
   * (0.5, 1.0) is common for feet/center of isometric sprites.
   */
  anchor?: { x: number; y: number };
}

/**
 * Normalized runtime version after loading/validation.
 * Guarantees sensible defaults for missing optional fields.
 */
export interface LoadedSpriteManifest extends SpriteManifest {
  scale: number;
  anchor: { x: number; y: number };
  frames: Array<SpriteFrame & { duration: number; center: FrameCenter }>;
}
