/**
 * Minimal 2D camera for the isometric world view.
 * Tracks world offset plus a zoom scalar used by the viewport projection.
 * Used to adjust world coordinates before passing to IsometricRenderer.
 */

export class Camera {
  x = 0;
  y = 0;
  zoom = 1;

  /** Returns world coords adjusted by camera offset (for the current proof). */
  worldToView(worldX: number, worldY: number) {
    return {
      x: worldX - this.x,
      y: worldY - this.y,
    };
  }

  pan(deltaX: number, deltaY: number): void {
    this.x += deltaX;
    this.y += deltaY;
  }

  zoomBy(factor: number): void {
    this.zoom = Math.min(2.4, Math.max(0.48, this.zoom * factor));
  }

  /**
   * Very rough world-space bounds for basic culling in the 1.6 proof.
   * Good enough to demonstrate skipping off-screen tiles.
   */
  getWorldViewBounds(screenWidth = 800, screenHeight = 600, padding = 3) {
    // Crude approximation based on current isometric scale
    const approx = (screenWidth + screenHeight) / 48 + padding;
    return {
      minX: this.x - approx,
      maxX: this.x + approx,
      minY: this.y - approx,
      maxY: this.y + approx,
    };
  }
}
