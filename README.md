# Web-Technologies-HW3

This is a small browser based game where you collect crops and try to avoid obstacles.

## How to run the game?
1. Clone the repository
2. Open index.html in a browser or run 'python -m http.server 8000' followed by 'http://localhost:8000' in a browser.
3. Click 'Start' to begin the game.
4. Use the arrow keys to move the farmer.
5. Collect crops to reach the goal within the alloted time.

## New Feautures
I added more crops to collect, as well as a points system for the crops.
The point system is as follows: wheat:1pt, berry:2pt, apple:3pt.
This allows for the player to gain points quicker by getting the higher point crops.
I also added a difficulty curve that increases spawn rates as the game progresses.
So, more crops will spawn the longer the game goes on, making it easier to win.

## Arrow Functions
Arrow functions are used throughout the game to help preserve the correct 'this' context, especially in callbacks:
this.tick = (ts) => { ... }; // requestAnimationFrame callback
this.crops.forEach(c => c.update(dt, this)); // 'this' refers to Game instance

## Bind
bind is used when attaching event listeners where arrow functions are less suitable:
this._onKeyDown = this.onKeyDown.bind(this);
this._onKeyUp = this.onKeyUp.bind(this);
window.addEventListener("keydown", this._onKeyDown);
window.addEventListener("keyup", this._onKeyUp);
This ensures that 'this' inside 'onKeyDown' and 'onKeyUp' always referes to the input distance, not the window.

## This
In the Game module, 'this' refers to the game instance, allowing access to player, crops, obstacles, and UI.
In the Farmer module, 'this' refers to the player instance, which is essential for movement and collision detection.
Arrow functions and bind help maintain the correct 'this' in callbacks and event handlers.
