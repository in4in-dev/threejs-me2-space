import * as THREE from 'three';
import Asteroid from "./Asteroid.ts";
import Component from "../Core/Component.ts";

export default class AsteroidBelt extends Component
{

	public radius : number;

	public mesh : THREE.Group | null = null;
	public asteroids : Asteroid[] | null = null;

	constructor(radius : number) {
		super();
		this.radius = radius;
	}

	public async load() : Promise<this>
	{

		this.mesh = await this.createBody();
		this.asteroids = await this.createAsteroids();

		return this;

	}

	public addTo(scene : THREE.Scene)
	{
		this.asteroids!.forEach(asteroid => asteroid.addTo(this.mesh!));
		scene.add(this.mesh!)
	}

	protected setRandomAsteroidPosition(asteroid : Asteroid) : Asteroid
	{

		let angle = Math.random() * 2 * Math.PI;

		asteroid.mesh!.position.set(
			THREE.MathUtils.randInt(this.radius - 1, this.radius + 1) * Math.cos(angle),
			THREE.MathUtils.randInt(this.radius - 1, this.radius + 1) * Math.sin(angle),
			THREE.MathUtils.randInt(-1, 1)
		);

		return asteroid;

	}

	protected generateAsteroid() : Asteroid
	{

		let templates = [
			{t : '../../asteroids/simple1.obj', m : '../../asteroids/simple1.mtl'},
			{t : '../../asteroids/simple2.obj', m : '../../asteroids/simple2.mtl'},
		];

		let template = templates[THREE.MathUtils.randInt(0, templates.length - 1)];

		return new Asteroid(template.t, template.m);

	}

	protected async createAsteroids() : Promise<Asteroid[]>
	{

		let asteroids = [];
		for(let i = 0; i < this.radius * 50; i++){

			let asteroid = await this.generateAsteroid().load();

			asteroids.push(
				this.setRandomAsteroidPosition(asteroid)
			);

		}

		return asteroids;

	}

	protected async createBody() : Promise<THREE.Group>{

		return new THREE.Group();

	}


}