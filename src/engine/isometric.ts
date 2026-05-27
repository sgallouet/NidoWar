/**
 * Pure isometric math utilities for 3/4 top-down view.
 * All functions are side-effect free and suitable for use on any thread.
 *
 * Coordinate system:
 * - World space: x increases right-down, y increases left-down (classic diamond).
 * - Screen space: standard 2D pixels, origin top-left.
 *
 * These functions form the foundation for all future rendering, culling,
 * pathfinding, and input handling. Keep this file small and stable.
 */

export interface Point {
  x: number;
  y: number;
}

/** Recommended default tile size for phone-friendly crisp pixel art. */
export const DEFAULT_TILE = {
  width: 64,
  height: 32,
} as const;

/**
 * Convert world tile coordinates to screen pixel position.
 * The returned position is the top-center of the diamond tile.
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  tileWidth: number = DEFAULT_TILE.width,
  tileHeight: number = DEFAULT_TILE.height
): Point {
  return {
    x: (worldX - worldY) * (tileWidth / 2),
    y: (worldX + worldY) * (tileHeight / 2),
  };
}

/**
 * Convert screen pixel position back to approximate world tile coordinates.
 * Useful for input picking. Returns fractional values — caller usually floors.
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  tileWidth: number = DEFAULT_TILE.width,
  tileHeight: number = DEFAULT_TILE.height
): Point {
  const halfW = tileWidth / 2;
  const halfH = tileHeight / 2;

  const worldX = (screenX / halfW + screenY / halfH) / 2;
  const worldY = (screenY / halfH - screenX / halfW) / 2;

  return { x: worldX, y: worldY };
}

/**
 * Returns the axis-aligned bounding box (in screen space) for a tile.
 * Useful for simple frustum culling before more advanced techniques.
 */
export function getTileScreenBounds(
  worldX: number,
  worldY: number,
  tileWidth: number = DEFAULT_TILE.width,
  tileHeight: number = DEFAULT_TILE.height
): { x: number; y: number; width: number; height: number } {
  const top = worldToScreen(worldX, worldY, tileWidth, tileHeight);

  return {
    x: top.x - tileWidth / 2,
    y: top.y,
    width: tileWidth,
    height: tileHeight,
  };
}

/**
 * Convenience re-export for the most common case.
 */
export const iso = {
  toScreen: worldToScreen,
  toWorld: screenToWorld,
  tileBounds: getTileScreenBounds,
};
