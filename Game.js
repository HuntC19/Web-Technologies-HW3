import { Farmer } from "./Farmers.js";
import { Crop } from "./Crop.js";
import { Scarecrow, aabb, clamp } from "./Obstacle.js";

// ---- Config & helpers ----

export const WIDTH = 900, HEIGHT = 540;
export const TILE = 30;
export const GAME_LEN = 60;
export const GOAL = 15;

/** @enum {string} Possible game states */
export const State = Object.freeze({
    MENU: "MENU", PLAYING: "PLAYING", PAUSED: "PAUSED", GAME_OVER: "GAME_OVER", WIN: "WIN"
});

// ---- Input ----
/**
 * Class representing keyboard input for the game.
 */
export class Input {
    /**
     * Create an input handler.
     * @param {Game} game - The game instance.
     */
    constructor(game) {
        this.game = game;
        this.keys = new Set();
        // bind is needed here because event listeners call the handler
        // with `this` set to the element (window), not our Input instance
        this._onKeyDown = this.onKeyDown.bind(this); // bind 1
        this._onKeyUp = this.onKeyUp.bind(this); // bind 2
        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);
    }
    /**
     * Handle keydown events.
     * @param {KeyboardEvent} e 
     */
    onKeyDown(e) {
        if (e.key === "p" || e.key === "P") this.game.togglePause();
        this.keys.add(e.key);
    }
    /**
     * Handle keyup events.
     * @param {KeyboardEvent} e 
     */
    onKeyUp(e) { this.keys.delete(e.key); }
    /**
     * Remove event listeners to clean up.
     */
    dispose() {
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
    }
}

// ---- Game ----
/**
 * Main Game class managing state, entities, and rendering.
 */
export class Game {
    /**
     * Create a game instance.
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
     */
    constructor(canvas) {
        if (!canvas) { console.error("Canvas #game not found."); return; }
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.state = State.MENU;

        // world
        this.player = new Farmer(WIDTH / 2 - 17, HEIGHT - 80);
        this.crops = [];
        this.obstacles = [];

        // timing
        this.lastTime = 0;
        this.timeLeft = GAME_LEN;
        this.spawnEvery = 0.8;
        this._accumSpawn = 0;

        // score & goal
        this.score = 0;
        this.goal = GOAL;

        // input & resize
        this.input = new Input(this);
        // bind is needed here because resize events are triggered by the window
        // without bindning, 'this' would refer to the window, not our Game instance
        this._onResize = this.onResize.bind(this);
        window.addEventListener("resize", this._onResize);

        // UI
        const get = id => document.getElementById(id) || console.error(`#${id} not found`);
        this.ui = {
            score: get("score"),
            time: get("time"),
            goal: get("goal"),
            status: get("status"),
            start: get("btnStart"),
            reset: get("btnReset"),
        };
        if (this.ui.goal) this.ui.goal.textContent = String(this.goal);
        // arrow keeps `this` as Game instance. Thus, no bind needed.
        // without arrow, `this` would be the button element when called.
        if (this.ui.start) this.ui.start.addEventListener("click", () => this.start()); // arrow keeps `this` as Game instance
        if (this.ui.reset) this.ui.reset.addEventListener("click", () => this.reset());

        // RAF loop as arrow function → lexical `this`
        // Without arrow, `this` would be undefined when passed in requestAnimationFrame
        this.tick = (ts) => {
            const dt = Math.min((ts - this.lastTime) / 1000, 0.033);
            this.lastTime = ts;
            this.update(dt);
            this.render();
            requestAnimationFrame(this.tick);
        };
    }

    /**
     * Optional handler for window resize.
     */
    onResize() { 
        // fixed canvas size for simplicity; handle DPR here if desired
    }

    /**
     * Start or resume the game.
     */
    start() {
        if ([State.MENU, State.GAME_OVER, State.WIN].includes(this.state)) {
            this.reset();
            this.state = State.PLAYING;
            if (this.ui.status) this.ui.status.textContent = "Playing…";
            requestAnimationFrame(this.tick); // this is bound via arrow above
        } else if (this.state === State.PAUSED) {
            this.state = State.PLAYING;
            if (this.ui.status) this.ui.status.textContent = "Playing…";
        }
    }

    /**
     * Reset the game to its initial state.
     */
    reset() {
        this.state = State.MENU;
        this.player = new Farmer(WIDTH / 2 - 17, HEIGHT - 80);
        this.crops.length = 0;
        this.obstacles.length = 0;
        this.score = 0;
        this.timeLeft = GAME_LEN;
        this._accumSpawn = 0;
        this.lastTime = performance.now();
        // place a couple of scarecrows
        this.obstacles.push(new Scarecrow(200, 220), new Scarecrow(650, 160));
        this.syncUI();
        if (this.ui.status) this.ui.status.textContent = "Menu";
    }

    /**
     * Pause or resume the game.
     */
    togglePause() {
        if (this.state === State.PLAYING) { this.state = State.PAUSED; this.ui.status && (this.ui.status.textContent = "Paused"); }
        else if (this.state === State.PAUSED) { this.state = State.PLAYING; this.ui.status && (this.ui.status.textContent = "Playing…"); }
    }

    /**
     * Update UI elements to reflect current game state.
     */
    syncUI() {
        if (this.ui.score) this.ui.score.textContent = String(this.score);
        if (this.ui.time) this.ui.time.textContent = Math.ceil(this.timeLeft);
        if (this.ui.goal) this.ui.goal.textContent = String(this.goal);
    }

    /**
     * Spawn a new crop at a random location.
     */
    spawnCrop() {
        const gx = Math.floor(Math.random() * ((WIDTH - 2 * TILE) / TILE)) * TILE + TILE;
        const gy = Math.floor(Math.random() * ((HEIGHT - 2 * TILE) / TILE)) * TILE + TILE;
        const type = Crop.randomType().name; // this chooses a random crop type
        this.crops.push(new Crop(gx, gy, type));
    }

    /**
     * Update game logic.
     * @param {number} dt - Delta time since last frame in seconds.
     */
    update(dt) {
        if (this.state !== State.PLAYING) return;
        // countdown
        this.timeLeft = clamp(this.timeLeft - dt, 0, GAME_LEN);
        if (this.timeLeft <= 0) {
            this.state = (this.score >= this.goal) ? State.WIN : State.GAME_OVER;
            this.ui.status && (this.ui.status.textContent = (this.state === State.WIN) ? "You Win!" : "Game Over");
            this.syncUI();
            return;
        }

        // player
        this.player.handleInput(this.input);
        this.player.update(dt, this);

        // swawn crops
        const progress = 1 - (this.timeLeft / GAME_LEN); // 0 to 1 as time passes
        this.spawnEvery = 0.8 - progress * 0.5; // from 0.8s to 0.3s
        this._accumSpawn += dt;
        while (this._accumSpawn >= this.spawnEvery) {
            this._accumSpawn -= this.spawnEvery;
            this.spawnCrop();
        }

        // collect crops
        // all callbacks are arrows so 'this' is safe
        // if we used normal functions, 'this' would be undefined in strict mode
        const collected = this.crops.filter(c => aabb(this.player, c));
        if (collected.length) {
            // forEach callback is arrow so 'this' is safe
            collected.forEach(c => c.dead = true);                  // arrow #2
            // this adds points based on crop type
            collected.forEach(c => {
                const t = Crop.TYPES.find(t => t.name === c.type);
                this.score += t?.points || 1;
            });
            this.ui.score && (this.ui.score.textContent = String(this.score));
            if (this.score >= this.goal) { this.state = State.WIN; this.ui.status && (this.ui.status.textContent = "You Win!"); }
        }
        // filter again with arrow so 'this' is safe
        this.crops = this.crops.filter(c => !c.dead);                // arrow #3
        // forEach ensures 'this' is the Game instance during update calls
        this.crops.forEach(c => c.update(dt, this));                // arrow #4

        // timer UI
        if (this.ui.time) this.ui.time.textContent = Math.ceil(this.timeLeft);
    }

    /**
     * Render the game canvas.
     */
    render() {
        const ctx = this.ctx; if (!ctx) return;

        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        // field background (grid)
        ctx.fillStyle = "#dff0d5";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.strokeStyle = "#c7e0bd";
        ctx.lineWidth = 1;
        for (let y = TILE; y < HEIGHT; y += TILE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
        for (let x = TILE; x < WIDTH; x += TILE) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke(); }

        // crops, obstacles, farmer
        // forEach ensures 'this' is the Game instance during draw calls
        this.crops.forEach(c => c.draw(ctx));             // arrow #5 
        this.obstacles.forEach(o => o.draw(ctx));         // arrow #6
        this.player.draw(ctx);

        // state labels
        ctx.fillStyle = "#333"; ctx.font = "16px system-ui, sans-serif";
        if (this.state === State.MENU) ctx.fillText("Press Start to play", 20, 28);
        else if (this.state === State.PAUSED) ctx.fillText("Paused (press P to resume)", 20, 28);
        else if (this.state === State.GAME_OVER) ctx.fillText("Time up! Press Reset to return to Menu", 20, 28);
        else if (this.state === State.WIN) ctx.fillText("Harvest complete! Press Reset for another round", 20, 28);
    }

    /** 
     * Clean up resources and event listeners. 
     */
    dispose() { this.input.dispose(); window.removeEventListener("resize", this._onResize); }
}

// ---- Boot ----
const canvas = document.getElementById("game");
export const game = new Game(canvas);
// Click 'Start' in the UI to begin