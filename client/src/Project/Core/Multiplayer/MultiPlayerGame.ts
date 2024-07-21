import Game from "../Game.ts";
import Background from "../../Components/Background.ts";
import Sun from "../../Components/Sun.ts";
import AsteroidBelt from "../../Components/AsteroidBelt.ts";
import Planet from "../../Components/Planet.ts";
import Border from "../../Components/Border.ts";
import * as THREE from 'three';
import Ship from "../../Components/Ship.ts";
import Player from "./Player.ts";
import io from 'socket.io-client';

export default class MultiPlayerGame extends Game
{

	protected socket : SocketIOClient.Socket;
	protected players : Player[];

	protected lastShipMovementSent : number = 0;

	constructor(
		background : Background,
		sun : Sun,
		asteroidBelt : AsteroidBelt,
		planets : Planet[],
		border : Border,
		players : Player[],
		socket : SocketIOClient.Socket
	) {

		super(background, sun, asteroidBelt, planets, border);

		this.socket = socket;
		this.players = players;

	}

	public async init(){

		for(let i in this.players){
			await this.players[i].ship.load();
		}

		await super.init();

	}

	public initScene(){

		this.setSocketListeners();

		this.players.forEach(player => {
			player.ship.addTo(this.scene);
		});

		super.initScene();

	}

	protected setSocketListeners(){

		this.socket.on('ship.moved', (data : any) => {

			let player = this.players.find(player => player.id === data.id);

			if(player){
				player.ship.moveToFast(data.ship.x, data.ship.y)
				player.ship.mesh!.rotation.y = data.ship.rotate;
			}

		});

		this.socket.on('ship.connected', async (data : any) => {

			let ship = await new Ship(data.ship.x, data.ship.y, 1).load();

			ship.addTo(this.scene);

			let player = new Player(data.id, ship);

			this.players.push(player);

		});

		this.socket.on('ship.disconnected', async (data : any) => {

			let player = this.players.find(player => player.id === data.id);

			if(player){

				this.players.splice(
					this.players.indexOf(player),
					1
				);

				//@TODO ship.removeFrom()
				this.scene.remove(
					player.ship.mesh!
				)

			}

		});

	}

	protected sendShipMovement(time : number){

		if(Date.now() - time >= this.lastShipMovementSent){

			this.lastShipMovementSent = Date.now();

			this.socket.emit('ship.moving', {
				x : this.ship.mesh!.position.x,
				y : this.ship.mesh!.position.y,
				rotate : this.ship.mesh!.rotation.y
			})

		}

	}

	public async tick(){

		this.sendShipMovement(30);
		super.tick();

	}

	public static create(port : number) : Promise<MultiPlayerGame>
	{

		let socket = io('ws://localhost:' + port, {
			path : '/',
			transports : ['websocket']
		});

		return new Promise((resolve) => {

			socket.on('university', (data: any) => {

				/**
				 * Генерация фона
				 */
				let background = new Background('../../assets/space_texture.jpg');

				/**
				 * Генерация солнца
				 */
				let sun = new Sun(data.university.sun.radius, 500, 'white', data.university.sun.glowColor);

				/**
				 * Генерация пояса астероидов
				 */
				let asteroidBelt = new AsteroidBelt(data.university.asteroidBelt.radius);

				/**
				 * Генерация планет
				 */
				let planets = data.university.planets.map((planet : any) => {
					return new Planet(
						planet.radius,
						planet.orbitRadius,
						planet.orbitAngle,
						planet.name,
						planet.texture,
						THREE.MathUtils.randInt(0, 3),
						!THREE.MathUtils.randInt(0, 3)
					);
				});

				/**
				 * Генерация границы
				 */
				let border = new Border(data.university.border.radius, '#549b24', 0.3);

				/**
				 *	Другие игроки
				 */
				console.log(data.players.length);

				let players = data.players.map((player : any) => {

					let ship = new Ship(player.ship.x, player.ship.y, 1);

					return new Player(player.id, ship);

				});

				resolve(
					new MultiPlayerGame(
						background,
						sun,
						asteroidBelt,
						planets,
						border,
						players,
						socket
					)
				);

			});

		});

	}

}