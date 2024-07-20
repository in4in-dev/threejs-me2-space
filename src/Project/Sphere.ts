import * as THREE from 'three';

export default class Sphere
{

	public texture : string;
	public radius : number;

	public mesh : THREE.Mesh;

	constructor(radius : number, texture : string) {

		this.radius = radius;
		this.texture = texture;

		this.mesh = this.createBody();

	}

	protected createBody() : THREE.Mesh
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