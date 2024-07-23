import * as THREE from 'three';
import Component from "../Core/Component";

export default abstract class Sphere extends Component
{

	public texture : string;
	public radius : number;

	constructor(radius : number, texture : string) {

		super();

		this.radius = radius;
		this.texture = texture;

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