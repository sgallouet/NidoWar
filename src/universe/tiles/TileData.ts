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
  readonly assetKey: string;
  readonly tileX: number;
  readonly tileY: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly frameIndex: number;
  readonly scale: number;
  readonly alpha?: number;
  readonly tint?: string;
}

export interface TileOccluderData extends TileDecalData {
  readonly shadowScale: number;
  readonly depthBias: number;
}

export interface TileLightData {
  readonly id: number;
  readonly tileX: number;
  readonly tileY: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly radius: number;
  readonly intensity: number;
  readonly color: string;
}

export function createTile(
  id: number,
  x: number,
  y: number,
  type: TerrainType = 'grass'
): TileData {
  return { id, x, y, type };
}
