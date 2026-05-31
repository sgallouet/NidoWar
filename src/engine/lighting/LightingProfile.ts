import type { RadialLightDrawOptions, SceneLightingDrawOptions } from '@engine/renderer/IRenderer';

export interface LightingProfile {
  readonly ambientColor: string;
  readonly ambientAlpha: number;
  readonly gradeColor: string;
  readonly gradeAlpha: number;
  readonly lightRadiusScale: number;
  readonly lightIntensityScale: number;
  readonly coreRadiusScale: number;
  readonly coreIntensityScale: number;
}

export const DAY_LIGHTING_PROFILE: LightingProfile = {
  ambientColor: '#142034',
  ambientAlpha: 0.07,
  gradeColor: '#ffd58a',
  gradeAlpha: 0.055,
  lightRadiusScale: 0.72,
  lightIntensityScale: 0.28,
  coreRadiusScale: 0.58,
  coreIntensityScale: 0.42,
};

export const NIGHT_LIGHTING_PROFILE: LightingProfile = {
  ambientColor: '#071025',
  ambientAlpha: 0.62,
  gradeColor: '#244b7b',
  gradeAlpha: 0.08,
  lightRadiusScale: 1.28,
  lightIntensityScale: 1,
  coreRadiusScale: 0.72,
  coreIntensityScale: 0.95,
};

export function createSceneLighting(
  profile: LightingProfile,
  lights: RadialLightDrawOptions[]
): SceneLightingDrawOptions {
  return {
    ambientColor: profile.ambientColor,
    ambientAlpha: profile.ambientAlpha,
    gradeColor: profile.gradeColor,
    gradeAlpha: profile.gradeAlpha,
    lights: lights.map((light) => ({
      ...light,
      radius: light.radius * profile.lightRadiusScale,
      intensity: light.intensity * profile.lightIntensityScale,
      coreRadius: Math.max(10, light.radius * profile.coreRadiusScale * 0.2),
      coreIntensity: light.intensity * profile.coreIntensityScale,
    })),
  };
}
