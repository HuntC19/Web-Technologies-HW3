/**
 * Clamp a value between a minimum and maximum.
 * @param {number} v - The value to clamp.
 * @param {number} lo - Minimum value.
 * @param {number} hi - Maximum value.
 * @returns {number} Clamped value.
 */
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Check if two rectangles are overlapping (Axis-Aligned Bounding Box collision).
 * @param {Object} a - First rectangle with x, y, w, h.
 * @param {Object} b - Second rectangle with x, y, w, h.
 * @returns {boolean} True if rectangles overlap, false otherwise.
 */
export const aabb = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export class Entity {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.dead = false;
    }

    update(dt, game) { /* optional override */ }
    draw(ctx) { /* optional override */ }
}


/**
 * Class representing a Scarecrow obstacle.
 */
export class Scarecrow extends Entity {
    /**
     * Create a Scarecrow.
     * @param {number} x - X position of the scarecrow.
     * @param {number} y - Y position of the scarecrow.
     */
    constructor(x, y) {
        super(x, y, 26, 46);
    }

    /**
     * Draw the Scarecrow on the canvas.
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
     */
    draw(ctx) {
        const { x, y, w, h } = this;
        ctx.fillStyle = "#9b7653";
        ctx.fillRect(x + w / 2 - 3, y, 6, h); // pole
        ctx.fillStyle = "#c28e0e";
        ctx.beginPath(); ctx.arc(x + w / 2, y + 10, 10, 0, Math.PI * 2); ctx.fill(); // head
        ctx.strokeStyle = "#6b4f2a"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x, y + 18); ctx.lineTo(x + w, y + 18); ctx.stroke(); // arms
    }
}