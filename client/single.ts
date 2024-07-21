import SinglePlayerGame from "./src/Project/Core/SinglePlayer/SinglePlayerGame";

// @ts-ignore
(async function(){

	let game = new SinglePlayerGame();

	await game.init();

	game.run();

})();

