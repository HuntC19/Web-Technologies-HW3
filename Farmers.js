import { aabb, clamp } from "./Obstacle.js";
import { WIDTH, HEIGHT } from "./Game.js";

/**
 * Represents the player character, a farmer who can move around the screen.
 */
export class Farmer {
    /**
     * Create a farmer.
     * @param {*} x - The starting x position of the farmer
     * @param {*} y - The starting y position of the farmer
     */
    constructor(x, y) {
        this.x = x; this.y = y; this.w = 34; this.h = 34;
        this.speed = 260;
        this.vx = 0; this.vy = 0;
        this.color = "#8b5a2b";
    }

    /**
     * Handles keyboard input to control the farmer's movement.
     * @param {Object} input - Input object containing pressed keys.
     * @param {Set<string>} input.keys - Set of currently pressed keys.
     */
    handleInput(input) {
        const L = input.keys.has("ArrowLeft"), R = input.keys.has("ArrowRight");
        const U = input.keys.has("ArrowUp"), D = input.keys.has("ArrowDown");
        this.vx = (R - L) * this.speed;
        this.vy = (D - U) * this.speed;
    }

    /**
     * Updates the farmer's position and handles collisions.
     * @param {number} dt - Delta time in seconds since last frame.
     * @param {Object} game - The game instance containing obstacles.
     */
    update(dt, game) {
        // try movement
        const oldX = this.x, oldY = this.y;
        this.x = clamp(this.x + this.vx * dt, 0, WIDTH - this.w);
        this.y = clamp(this.y + this.vy * dt, 0, HEIGHT - this.h);
        // block through obstacles
        const hitObs = game.obstacles.some(o => aabb(this, o));
        if (hitObs) { this.x = oldX; this.y = oldY; }
    }

    /**
     * Draws the farmer on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context.
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = "#c28e0e";
        ctx.fillRect(this.x + 4, this.y - 6, this.w - 8, 8);    // hat brim
        ctx.fillRect(this.x + 10, this.y - 18, this.w - 20, 12); // hat top
    }
}