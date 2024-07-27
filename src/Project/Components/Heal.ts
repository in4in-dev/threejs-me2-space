import Component from "../Core/Component";
import * as THREE from 'three';
import {Vector3} from "three";
import Random from "../../Three/Random";
import Drop from "./Drop";
import Healthy from "../Contracts/Healthy";

export default class Heal extends Drop<Healthy>
{

	public healths : number;

	protected mesh : THREE.Mesh;

	constructor(healths : number, radius : number = 0.1) {
		super();
		this.healths = healths;
		this.mesh = this.createMesh(radius);

		this.add(this.mesh);
	}

	protected createMesh(radius : number) : THREE.Mesh
	{

		let sphere = new THREE.Mesh(
			new THREE.SphereGeometry(radius, 10, 10),
			new THREE.MeshBasicMaterial({color : 'white', transparent : true, opacity : 0.7})
		);

		let sprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.TextureLoader().load('../../assets/glow.png'),
				transparent: true,
				color : 'green',
				blending : THREE.AdditiveBlending,
				depthWrite:false,
			})
		);

		sprite.scale.set(radius * 10, radius * 10, radius * 10);

		sphere.add(sprite);

		return sphere;

	}

	public use(target : Healthy){
		target.heal(this.healths);
	}

}