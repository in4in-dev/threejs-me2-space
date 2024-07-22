import Ship from "../../Components/Ship.ts";

export default class Player
{

	public id : string;
	public ship : Ship;

	constructor(id : string, ship : Ship) {
		this.id = id;
		this.ship = ship;
	}

}