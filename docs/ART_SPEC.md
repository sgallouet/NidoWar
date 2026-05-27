# Art Specification (Codex Reference)

All graphics are **pixel art sprites or spritesheets**.

## Strict Requirements
- Art is **always provided transparent** (alpha channel). Never attempt to auto-remove backgrounds in code or by hand — ask user to re-export if missing.
- Low-detail, crisp, strong linework, simple shading, light props, high-contrast vivid "poetic" colors (Japanese animation / retro J-RPG feel).
- Smartphone-first: legible at small sizes, good touch targets, minimal fine detail.

## Sprite Manifest (JSON) - Mandatory
Every sprite or spritesheet **must** have a matching `.json` sidecar file that defines:

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

### Field meanings
- `frames[].rect` (or x,y,w,h): rectangular boundary in source image.
- `center` (or pivot): local origin for placement/rotation (pixel coords inside frame).
- `duration`: ms per frame. 0 or omitted = still frame.
- `scale`: scalar applied at render time (allows mixing different source resolutions).
- `anchor`: normalized (0-1) point used for world positioning (common for isometric feet/center).

## Usage in Engine
- Engine never hardcodes pixel numbers from art.
- All drawing goes through a `SpriteRenderer` or equivalent that reads the manifest.
- This allows art to be replaced without touching gameplay code.

## UI Style
- Minimal text. Beautiful retro J-RPG aesthetic.
- Icons + symbols preferred over words.
- High contrast, readable on phone in bright sunlight.
