import { Entity } from "./Obstacle.js";

/**
 * Class representing a collectible crop in the game.
 */
export class Crop extends Entity {
    /**
     * Create a crop.
     * @param {number} x - The x-coordinate of the crop.
     * @param {number} y - The y-coordinate of the crop.
     * @param {string} [type="wheat"] - The type of the crop ("wheat", "berry", "apple").
     */
    constructor(x, y, type = "wheat") {
        super(x, y, 20, 26);
        this.type = type;
        this.sway = Math.random() * Math.PI * 2;
        this.dead = false;
    }

    /**
     * Predefined crop types with points and colors.
     * @type {{name: string, points: number, color: string}[]}
     */
    static TYPES = [
        { name: "wheat", points: 1, color: "#d9a441" },
        { name: "berry", points: 2, color: "#2307f7ff" },
        { name: "apple", points: 3, color: "#ff0000ff" },
    ];

    /**
     * Get a random crop type from TYPES.
     * @returns {{name: string, points: number, color: string}} A random crop type.
     */
    static randomType() {
        return Crop.TYPES[Math.floor(Math.random() * Crop.TYPES.length)];
    }

    /**
     * Update the crop's animation state.
     * @param {number} dt - Delta time in seconds since last frame.
     */
    update(dt) {
        this.sway += dt * 2;
    }

    /**
     * Draw the crop on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context.
     */
    draw(ctx) {
        const { x, y, w, h } = this;
        ctx.strokeStyle = "#2f7d32";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h);
        ctx.quadraticCurveTo(x + w / 2 + Math.sin(this.sway) * 3, y + h / 2, x + w / 2, y);
        ctx.stroke();
        const style = Crop.TYPES.find(t => t.name === this.type);
        ctx.fillStyle = style?.color || "#d9a441";
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}