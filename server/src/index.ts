import GameServer from "./Core/GameServer";

let port = 5174;
let game = new GameServer(port);

game.start();

console.log('Start on port', port);