/**
 * NidoWar - Thin bootstrap entry.
 * All real work lives in engine/, gameplay/, universe/.
 * This file must stay tiny forever (imports only + one call to the real entry point).
 */
import './style.css';

import { IsometricViewport } from './engine/viewport/IsometricViewport';
import { createPerformanceMonitor } from './ui/PerformanceMonitor';

const performanceMonitor = createPerformanceMonitor();

// Start the current rendering foundation.
// All technical logic (renderer choice, camera, input, map, drawing) lives in engine/.
const viewport = new IsometricViewport({
  mapWidth: 90,
  mapHeight: 90,
  onFrameStats: (stats) => {
    performanceMonitor?.record(stats.frameMs, {
      draw: stats.drawCalls,
      sprites: stats.visibleSprites,
      tiles: stats.visibleTiles,
      pooled: stats.pooledSprites,
    });
  },
});

viewport.start().catch(console.error);
