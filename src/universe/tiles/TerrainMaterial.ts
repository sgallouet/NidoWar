export type TerrainMaterialId = 'grass' | 'dirt' | 'cobblestone' | 'forest' | 'water';

export interface TerrainMaterial {
  readonly id: TerrainMaterialId;
  readonly image: HTMLImageElement;
}

export type TerrainMaterialSet = Record<TerrainMaterialId, TerrainMaterial>;

export type TerrainBlend = Record<TerrainMaterialId, number>;

export function createTerrainBlend(values: Partial<TerrainBlend>): TerrainBlend {
  const blend: TerrainBlend = {
    grass: values.grass ?? 0,
    dirt: values.dirt ?? 0,
    cobblestone: values.cobblestone ?? 0,
    forest: values.forest ?? 0,
    water: values.water ?? 0,
  };
  const total = Object.values(blend).reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    return { ...blend, grass: 1 };
  }

  return {
    grass: blend.grass / total,
    dirt: blend.dirt / total,
    cobblestone: blend.cobblestone / total,
    forest: blend.forest / total,
    water: blend.water / total,
  };
}
