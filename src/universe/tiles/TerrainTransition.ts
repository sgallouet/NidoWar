import type { TerrainBlend, TerrainMaterialId } from './TerrainMaterial';
import { MATERIAL_IDS, createTerrainBlend } from './TerrainMaterial';

export interface TerrainTransition {
  readonly primary: TerrainMaterialId;
  readonly secondary: TerrainMaterialId;
  readonly edgeAmount: number;
  readonly accentAmount: number;
  readonly blend: TerrainBlend;
}

export function resolveTerrainTransition(blend: TerrainBlend, mask: number): TerrainTransition {
  const ranked = [...MATERIAL_IDS].sort((a, b) => blend[b] - blend[a]);
  const primary = ranked[0];
  const secondary = ranked[1];
  const primaryWeight = blend[primary];
  const secondaryWeight = blend[secondary];
  const dominance = primaryWeight - secondaryWeight;
  const edgeAmount = smoothstep(0.04, 0.26, secondaryWeight) * (1 - smoothstep(0.08, 0.42, dominance));
  const biteAmount = edgeAmount * smoothstep(0.18, 0.72, mask);
  const sharpened = sharpenBlend(blend, primary, secondary, biteAmount);

  return {
    primary,
    secondary,
    edgeAmount,
    accentAmount: edgeAmount * (0.55 + mask * 0.45),
    blend: sharpened,
  };
}

function sharpenBlend(
  blend: TerrainBlend,
  primary: TerrainMaterialId,
  secondary: TerrainMaterialId,
  biteAmount: number
): TerrainBlend {
  const sharpened = createTerrainBlend({
    grass: Math.pow(blend.grass, 2.6),
    dirt: Math.pow(blend.dirt, 2.6),
    cobblestone: Math.pow(blend.cobblestone, 2.6),
    forest: Math.pow(blend.forest, 2.6),
    water: Math.pow(blend.water, 2.6),
  });

  if (biteAmount <= 0.02) return sharpened;

  return createTerrainBlend({
    ...sharpened,
    [primary]: sharpened[primary] * (1 - biteAmount * 0.62),
    [secondary]: sharpened[secondary] + biteAmount * 0.62,
  });
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return amount * amount * (3 - 2 * amount);
}
