import Attack from "../Attack";
import {Object3D, Vector3} from "three";
import * as THREE from 'three';
import Hittable from "../Hittable";

export default class ShockWaveAttack extends Attack
{

	protected color : any;
	protected glowColor : any;
	protected startTime : number;
	protected maxRadius : number;

	protected speed : number = 500;

	protected mesh : THREE.Mesh;

	protected hitEnemies : Hittable[] = [];

	constructor(
		from : Vector3,
		force : number,
		maxRadius : number,
		color : any,
		glowColor : any
	) {
		super(from, force);

		this.color = color;
		this.glowColor = glowColor;
		this.maxRadius = maxRadius;
		this.startTime = Date.now();
		this.mesh = this.createBody(0.01);

		this.add(this.mesh);

	}

	protected createBody(radius : number) : THREE.Mesh
	{

		let mesh = new THREE.Mesh(
			new THREE.CircleGeometry(radius, 64),
			new THREE.MeshBasicMaterial({ color: this.color, transparent : true, opacity : 0.2 })
		);

		mesh.position.copy(this.from);

		return mesh;

	}

	public updateFrom(from : Vector3){
		this.from = from.clone();
	}

	public animate(
		peaceObjects: Object3D[],
		enemies: Hittable[]
	){

		let progress =  Math.min(1, (Date.now() - this.startTime) / this.speed),
			radius = progress * this.maxRadius;

		if(progress === 1){
			this.hide();
		}else{

			enemies.forEach(enemy => {

				if(this.hitEnemies.indexOf(enemy) < 0 && enemy.position.distanceTo(this.from) <= radius){

					let damage = Math.ceil(
						Math.max(0.5, 1 - progress / 2) * this.force
					);

					enemy.hit(damage);

					this.hitEnemies.push(enemy);

				}

			});


			let body = this.createBody(radius);

			this.mesh.geometry.copy(body.geometry);

		}

	}

}