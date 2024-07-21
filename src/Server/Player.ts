import Ship from "./Ship.ts";

export default class Player
{

	public ship : Ship;

	constructor() {
		this.ship = new Ship(0, 0, 0, 0);
	}

}