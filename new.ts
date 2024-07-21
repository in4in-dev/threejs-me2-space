import SinglePlayerGame from "./src/Project/Core/SinglePlayer/SinglePlayerGame";




let game = new SinglePlayerGame(

);

await game.init();
game.run();

console.log(game);