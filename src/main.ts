/**
 * NidoWar - Thin bootstrap entry.
 * All real work lives in engine/, gameplay/, universe/.
 * This file must stay tiny forever (imports only + one call to the real entry point).
 */
import './style.css';

import { IsometricViewport } from './engine/viewport/IsometricViewport';

// Start the current rendering foundation.
// All technical logic (renderer choice, camera, input, map, drawing) lives in engine/.
const viewport = new IsometricViewport({
  usePixi: true,
  mapWidth: 50,
  mapHeight: 50,
});

viewport.start().catch(console.error);
