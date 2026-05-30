# Art Specification (Codex Reference)

All graphics are pixel art sprites, spritesheets, or manifest-declared terrain materials.

## Strict Requirements
- Art is always provided transparent when it is a sprite, prop, decal, unit, building, effect, or transition piece. Never attempt to auto-remove backgrounds in code or by hand. Ask for a corrected export if alpha is missing.
- Opaque terrain material textures are allowed only for base materials such as grass, dirt, stone, water, and forest floor.
- The visual target is defined in `docs/ART_DIRECTION.md`: original high-detail modern isometric pixel fantasy strategy art with dense terrain storytelling, painterly pixel clusters, dramatic warm/cool lighting, and strong readable silhouettes.
- Reference screenshots from commercial games are a quality bar only. Do not request or create exact copies of their sprites, structures, UI, faction marks, map layouts, or distinctive compositions.
- Smartphone-first readability still matters: dense art is allowed, but units, interactables, roads, obstacles, and selection states must stay legible at small sizes.
- World map and battle arena art must share the same palette logic, lighting language, perspective discipline, and sprite density.
- A plain terrain texture with scattered decals is not accepted as final art. Terrain must be built from materials, transitions, clustered decals, medium props, tall occluders, contact shadows, and lighting.

## Sprite Manifest (JSON) - Mandatory

Every sprite or spritesheet must have a matching `.json` sidecar file that defines:

```json
{
  "name": "hero_walk",
  "image": "hero_walk.png",
  "frameSize": { "w": 64, "h": 48 },
  "frames": [
    { "x": 0, "y": 0, "w": 64, "h": 48, "duration": 120, "center": { "x": 32, "y": 40 } },
    { "x": 64, "y": 0, "w": 64, "h": 48, "duration": 120, "center": { "x": 32, "y": 40 } }
  ],
  "scale": 1.0,
  "anchor": { "x": 0.5, "y": 1.0 }
}
```

### Field Meanings
- `frames[].rect` or `x,y,w,h`: rectangular boundary in source image.
- `center` or `pivot`: local origin for placement/rotation in pixel coords inside the frame.
- `duration`: ms per frame. 0 or omitted means still frame.
- `scale`: scalar applied at render time so different source resolutions can mix safely.
- `anchor`: normalized 0-1 point used for world positioning, usually feet or footprint center.

## Usage In Engine
- Engine never hardcodes pixel numbers from art.
- All drawing goes through a renderer or view object that reads the manifest.
- This allows art to be replaced without touching gameplay code.

## Terrain Material Manifests
- Terrain materials also use the sprite manifest format, even when they are opaque seamless textures.
- Phase 2 terrain material ids are `grass`, `dirt`, `cobblestone`, `forest`, and `water`.
- Source files may be placeholder PNGs while the pipeline is under construction, but replacement art must keep the manifest name and material id stable unless the code and plan are updated together.
- Material textures should be seamless square PNGs. Current placeholders are 128x128; final art may use 256x256 or 512x512 if performance evidence stays healthy.
- Transition sprites, prop atlases, light source sprites, and contact shadows must remain transparent and manifest-backed.

## Asset Prompt Source
- Use `docs/ASSET_PROMPTS.md` as the starting prompt deck for generated sprites, terrain textures, decals, world props, battle arena tiles, and unit sprites.
- Prompts must describe the NidoWar art direction directly instead of naming another game or artist as the requested style.
- Generated art is not accepted until it has a matching manifest and a quick in-game or atlas QA screenshot.

## UI Style
- Minimal text. Rich fantasy strategy interface, readable over dense pixel art.
- Icons and symbols preferred over words.
- High contrast, readable on phone in bright sunlight.
