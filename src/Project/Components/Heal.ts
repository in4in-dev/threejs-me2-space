import Component from "../Core/Component";
import * as THREE from 'three';
import {Vector3} from "three";

export default class Heal extends Component
{

	public healths : number;
	public isUsed : boolean = false;

	public movingTarget : Vector3 | null = null;

	protected mesh : THREE.Mesh;

	constructor(healths : number) {
		super();
		this.healths = healths;
		this.mesh = this.createMesh();

		this.add(this.mesh);
	}

	protected createMesh() : THREE.Mesh
	{

		let sphere = new THREE.Mesh(
			new THREE.SphereGeometry(0.07, 10, 10),
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

		sprite.scale.set(1, 1, 1);

		sphere.add(sprite);

		return sphere;

	}

	public setMovingTarget(target : Vector3){
		this.movingTarget = target.clone();
	}

	public clearMovingTarget(){
		this.movingTarget = null;
	}

	public used(){
		this.isUsed = true;
	}

	public animate(){

		if(this.movingTarget) {

			let direction = new Vector3().subVectors(this.position, this.movingTarget);

			if(direction.length() > 0.1){

				direction.normalize();

				this.position.add(
					direction.multiplyScalar(-0.1)
				);

			}

		}

	}

}