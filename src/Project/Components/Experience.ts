import * as THREE from 'three';
import Drop from "./Drop";
import Experienced from "../Contracts/Experienced";

export default class Experience extends Drop<Experienced>
{

	public value : number;

	protected mesh : THREE.Mesh;

	constructor(value : number, radius : number = 0.1) {
		super();
		this.value = value;
		this.mesh = this.createMesh(radius);

		this.add(this.mesh);
	}

	protected createMesh(radius : number) : THREE.Mesh
	{

		let sphere = new THREE.Mesh(
			new THREE.SphereGeometry(radius, 2, 2),
			new THREE.MeshBasicMaterial({color : 'white', transparent : true, opacity : 0.7})
		);

		let sprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.TextureLoader().load('../../assets/glow.png'),
				transparent: true,
				color : '#0477b4',
				blending : THREE.AdditiveBlending,
				depthWrite:false,
			})
		);

		sprite.scale.set(1, 1, 1);

		sphere.add(sprite);

		return sphere;

	}

	public use(target : Experienced){
		target.exp(this.value);
	}

}