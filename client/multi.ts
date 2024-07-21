import MultiPlayerGame from "./src/Project/Core/Multiplayer/MultiPlayerGame";

// @ts-ignore
(async function(){

	let game = await MultiPlayerGame.create(5174);

	await game.init();

	game.run();

})();

