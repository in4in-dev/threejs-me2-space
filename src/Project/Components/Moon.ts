import Sphere from "./Sphere";
import * as THREE from 'three';

export default class Moon extends Sphere
{

	public planetRadius : number;

	protected mesh : THREE.Mesh | null = null;

	constructor(planetRadius : number, radius : number, texture : string) {
		super(radius, texture);

		this.planetRadius = planetRadius;
	}

	public async load() : Promise<this>
	{

		this.mesh = await this.createBody();
		this.add(this.mesh);

		this.setRandomPosition(this.planetRadius);

		return this;

	}

	protected setRandomPosition(planetRadius : number)
	{
		let angle = Math.random() * 2 * Math.PI;

		this.mesh!.position.set(
			(planetRadius * 1.2) * Math.cos(angle),
			(planetRadius + 1.2) * Math.sin(angle),
			0.5
		);
	}

}