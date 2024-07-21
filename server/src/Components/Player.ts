import Ship from "./Ship";
import {Socket} from "socket.io";
import * as uuid from 'uuid';
import SocketResponse from "../Core/SocketResponse";

export default class Player implements SocketResponse
{

	public id : string;
	public ship : Ship;
	public socket : Socket;

	constructor(socket : Socket) {
		this.id = uuid.v4();
		this.ship = new Ship(10, 10, 0, 0);
		this.socket = socket;
	}

	public toSocketJson(): any {
		return {
			id : this.id,
			ship : this.ship.toSocketJson()
		}
	}

}