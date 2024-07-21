import * as THREE from 'three';
import Component from "../Core/Component.ts";

export default abstract class Sphere extends Component
{

	public texture : string;
	public radius : number;

	public mesh : THREE.Mesh | null = null;

	constructor(radius : number, texture : string) {

		super();

		this.radius = radius;
		this.texture = texture;

	}

	public async load() : Promise<this>
	{
		this.mesh = await this.createBody();

		return this;
	}

	protected async createBody() : Promise<THREE.Mesh>
	{

		let planetTexturre = new THREE.TextureLoader().load(this.texture);
		let planetMaterial = new THREE.MeshLambertMaterial({ map: planetTexturre });

		let planet = new THREE.Mesh(
			new THREE.SphereGeometry(this.radius, 200, 200),
			planetMaterial
		);

		return planet;

	}

}