import {Server, Socket} from "socket.io";
import {createServer} from "http";
import SocketServer from "./SocketServer";
import Player from "../Components/Player";
import Ship from "../Components/Ship";
import University from "../Components/University";

export default class GameServer extends SocketServer
{

	protected players : Player[] = [];
	protected university : University;

	constructor(port : number) {

		super(port);

		this.university = new University();

	}

	protected setEvents() {

		this.socket.on('connection', (connection : Socket) => {

			let player = new Player(connection);

			console.log('Connected new player', player.id);

			this.emitGlobal('test', {a : 2});

			connection.emit('university', {
				you : player.toSocketJson(),
				university : this.university.toSocketJson(),
				players : this.players.map(player => player.toSocketJson())
			});

			this.players.push(player);

			//Движение корабля
			connection.on('ship.moving', (data) => {

				player.ship.moveTo(data.x, data.y);
				player.ship.rotation(data.rotate);

				this.emitGlobal('ship.moved', player.toSocketJson());

			});

			connection.on('disconnect', () => {

				this.players.splice(
					this.players.indexOf(player),
					1
				);

				this.emitGlobal('ship.disconnected', player.toSocketJson());

				console.log('Disconnect player', player.id);

			});

			this.emitGlobal('ship.connected', player.toSocketJson());


		});

	}

}