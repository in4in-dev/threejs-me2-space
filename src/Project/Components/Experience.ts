import Component from "../Core/Component";
import * as THREE from 'three';
import {Vector3} from "three";
import Random from "../../Three/Random";
import Drop from "./Drop";
import Healthy from "../Contracts/Healthy";
import {NormandyShip} from "./Ships/Normandy/NormandyShip";
import Experienced from "../Contracts/Experienced";

export default class Experience extends Drop<Experienced>
{

	public value : number;

	protected mesh : THREE.Mesh;

	constructor(value : number) {
		super();
		this.value = value;
		this.mesh = this.createMesh();

		this.add(this.mesh);
	}

	protected createMesh() : THREE.Mesh
	{

		let sphere = new THREE.Mesh(
			new THREE.SphereGeometry(Random.float(0.07, 0.11), 2, 2),
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