/**
 * Pure data model for a single tile.
 * No rendering, no game rules — only the minimal shape needed by views.
 */
export type TerrainType = 'grass' | 'dirt' | 'forest' | 'water';

export interface TileData {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly type: TerrainType;
}

export interface TileDecalData {
  readonly id: number;
  readonly tileX: number;
  readonly tileY: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly frameIndex: number;
  readonly scale: number;
}

export function createTile(
  id: number,
  x: number,
  y: number,
  type: TerrainType = 'grass'
): TileData {
  return { id, x, y, type };
}
