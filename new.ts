import Game from "./src/Project/Core/SinglePlayer/Game";

let game = new Game();

await game.init();
game.run();

console.log(game);