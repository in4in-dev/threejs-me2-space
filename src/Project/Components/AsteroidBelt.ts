import * as THREE from 'three';
import Asteroid from "./Asteroid";
import Component from "../Core/Component";
import Belt from "./Belt";
import Random from "../../Three/Random";

export default class AsteroidBelt extends Component
{

	public radius : number;

	/**
	 * Астероиды
	 */
	public asteroids : Asteroid[] | null = null;

	/**
	 * Искринки
	 */
	public belt : Belt | null = null;



	constructor(radius : number) {
		super();
		this.radius = radius;
	}

	public async load() : Promise<this>
	{

		this.belt = await this.createBelt();
		this.asteroids = await this.createAsteroids();

		this.add(this.belt);
		this.add(...this.asteroids);

		return this;

	}

	protected async createAsteroid() : Promise<Asteroid>
	{

		let templates = [
			{t : '../../assets/asteroids/simple1.obj', m : '../../assets/asteroids/simple1.mtl'},
			{t : '../../assets/asteroids/simple2.obj', m : '../../assets/asteroids/simple2.mtl'},
		];

		let template = Random.arr(templates);

		let asteroid = await new Asteroid(template.t, template.m).load();

		//Случайная позиция в поясе
		let angle = Math.random() * 2 * Math.PI;

		asteroid.position.set(
			Random.int(this.radius - 1, this.radius + 1) * Math.cos(angle),
			Random.int(this.radius - 1, this.radius + 1) * Math.sin(angle),
			Random.int(-1, 1)
		);

		return asteroid;

	}


	protected async createAsteroids() : Promise<Asteroid[]>
	{

		let asteroids = [];

		for(let i = 0; i < this.radius * 50; i++){

			asteroids.push(
				await this.createAsteroid()
			);

		}

		return asteroids;

	}

	protected async createBelt() : Promise<Belt>
	{

		let thickness = Random.float(0.4, 3);

		return await new Belt(this.radius, thickness).load();

	}


}