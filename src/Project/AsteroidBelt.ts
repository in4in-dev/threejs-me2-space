import * as THREE from 'three';
import Asteroid from "./Asteroid.ts";

export default class AsteroidBelt
{

	public radius : number;

	public asteroids : Asteroid[];

	constructor(radius : number) {
		this.radius = radius;
		this.asteroids = this.createAsteroids();
	}

	public async load(){

		for(let i in this.asteroids){
			await this.asteroids[i].load();
			this.setRandomPosition(this.asteroids[i]);
		}

	}

	protected setRandomPosition(asteroid : Asteroid){

		let angle = Math.random() * 2 * Math.PI;

		asteroid.mesh!.position.set(
			THREE.MathUtils.randInt(this.radius - 1, this.radius + 1) * Math.cos(angle),
			THREE.MathUtils.randInt(this.radius - 1, this.radius + 1) * Math.sin(angle),
			THREE.MathUtils.randInt(-1, 1)
		);

	}

	public addToScene(scene : THREE.Scene)
	{
		this.asteroids.forEach(asteroid => asteroid.addToScene(scene));
	}

	protected generateAsteroid() : Asteroid {

		let templates = [
			{t : '../../asteroids/simple1.obj', m : '../../asteroids/simple1.mtl'},
			{t : '../../asteroids/simple2.obj', m : '../../asteroids/simple2.mtl'},
		];

		let template = templates[THREE.MathUtils.randInt(0, templates.length - 1)];

		return new Asteroid(template.t, template.m);

	}

	protected createAsteroids() : Asteroid[]
	{

		let asteroids = [];
		for(let i = 0; i < this.radius * 50; i++){

			asteroids.push(
				this.generateAsteroid()
			);

		}

		return asteroids;

	}


}