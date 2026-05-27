/**
 * Async asset loader with manifest parsing and simple caching.
 * All sprite loading in the game must go through this module.
 *
 * Current scope (1.2): JSON manifests only. Actual image/texture loading
 * will be added when we integrate with the renderer (Pixi or Canvas).
 */

import type { LoadedSpriteManifest, SpriteManifest } from './AssetManifest';

const manifestCache = new Map<string, LoadedSpriteManifest>();

/**
 * Loads and validates a sprite manifest JSON file.
 * Results are cached by URL for the lifetime of the app.
 */
export async function loadSpriteManifest(
  manifestUrl: string
): Promise<LoadedSpriteManifest> {
  if (manifestCache.has(manifestUrl)) {
    return manifestCache.get(manifestUrl)!;
  }

  const response = await fetch(manifestUrl);
  if (!response.ok) {
    throw new Error(
      `[AssetLoader] Failed to fetch manifest: ${manifestUrl} (${response.status})`
    );
  }

  const raw = (await response.json()) as SpriteManifest;

  const normalized = normalizeManifest(raw, manifestUrl);

  manifestCache.set(manifestUrl, normalized);
  return normalized;
}

/** Basic normalization + validation with helpful errors. */
function normalizeManifest(
  raw: SpriteManifest,
  sourceUrl: string
): LoadedSpriteManifest {
  if (!raw.name || !raw.image || !Array.isArray(raw.frames)) {
    throw new Error(
      `[AssetLoader] Invalid manifest at ${sourceUrl}: missing name, image, or frames[]`
    );
  }

  if (raw.frames.length === 0) {
    throw new Error(`[AssetLoader] Manifest has no frames: ${sourceUrl}`);
  }

  const normalizedFrames = raw.frames.map((f, index) => {
    if (typeof f.x !== 'number' || typeof f.y !== 'number' || typeof f.w !== 'number' || typeof f.h !== 'number') {
      throw new Error(
        `[AssetLoader] Frame ${index} in ${sourceUrl} is missing x/y/w/h`
      );
    }

    return {
      ...f,
      duration: f.duration ?? 0,
      center: f.center ?? { x: f.w / 2, y: f.h / 2 },
    };
  });

  return {
    ...raw,
    scale: raw.scale ?? 1.0,
    anchor: raw.anchor ?? { x: 0.5, y: 1.0 },
    frames: normalizedFrames,
  };
}

/** Clears the manifest cache (useful for tests or hot-reload scenarios). */
export function clearManifestCache(): void {
  manifestCache.clear();
}

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Loads an image (png, etc.) with simple in-memory caching.
 * All sprite image loading must go through this (paired with loadSpriteManifest).
 */
export async function loadImage(imageUrl: string): Promise<HTMLImageElement> {
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl)!;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(imageUrl, img);
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error(`[AssetLoader] Failed to load image: ${imageUrl}`));
    };
    img.src = imageUrl;
  });
}
