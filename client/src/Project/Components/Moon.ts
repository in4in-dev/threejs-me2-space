import * as THREE from 'three';
// @ts-ignore
import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";
import Sphere from "./Sphere.ts";

export default class Moon extends Sphere
{

	public planetRadius : number;

	constructor(planetRadius : number, radius : number, texture : string) {
		super(radius, texture);

		this.planetRadius = planetRadius;
	}

	public async load() : Promise<this>
	{

		await super.load();

		this.setRandomPosition(this.planetRadius);

		return this;
	}

	public addTo(mesh : THREE.Mesh){
		mesh.add(this.mesh!);
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