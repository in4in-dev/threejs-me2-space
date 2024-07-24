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
	public asteroids : Asteroid[] = [];

	/**
	 * Искринки
	 */
	public belt : Belt;

	constructor(radius : number) {
		super();
		this.radius = radius;

		this.belt = this.createBelt();
		this.asteroids = this.createAsteroids();

		this.add(this.belt);
		this.add(...this.asteroids);
	}

	protected createAsteroid() : Asteroid
	{

		let templates = [
			{t : '../../assets/asteroids/simple1.obj', m : '../../assets/asteroids/simple1.mtl'},
			{t : '../../assets/asteroids/simple2.obj', m : '../../assets/asteroids/simple2.mtl'},
		];

		let template = Random.arr(templates);

		let asteroid = new Asteroid(template.t, template.m);

		//Случайная позиция в поясе
		let angle = Math.random() * 2 * Math.PI;

		asteroid.position.set(
			Random.int(this.radius - 1, this.radius + 1) * Math.cos(angle),
			Random.int(this.radius - 1, this.radius + 1) * Math.sin(angle),
			Random.int(-1, 1)
		);

		return asteroid;

	}


	protected createAsteroids() : Asteroid[]
	{

		let asteroids = [];

		for(let i = 0; i < this.radius * 50; i++){

			asteroids.push(
				this.createAsteroid()
			);

		}

		return asteroids;

	}

	protected createBelt() : Belt
	{

		let thickness = Random.float(0.4, 3);

		return new Belt(this.radius, thickness);

	}


}