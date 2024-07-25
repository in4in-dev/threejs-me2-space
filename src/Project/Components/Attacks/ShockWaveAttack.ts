import Attack from "../Attack";
import {Object3D, Vector3} from "three";
import * as THREE from 'three';
import Hittable from "../../Contracts/Hittable";
import Random from "../../../Three/Random";

export default class ShockWaveAttack extends Attack
{

	protected color : any;
	protected glowColor : any;
	protected startTime : number;
	protected maxRadius : number;

	protected speed : number = 500;

	protected mesh : THREE.Points;

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

	protected generatePositions(radius : number) : number[]
	{

		let positions = [];

		for (let i = 0; i < radius * 2000; i++) {

			let theta = 2 * Math.PI * Math.random();

			let x = Random.float(0.9, 1.1) * radius *  Math.cos(theta);
			let y = Random.float(0.9, 1.1) * radius *  Math.sin(theta);
			let z = -2;

			positions.push(x, y, z);

		}

		return positions;

	}

	protected createBody(radius : number) : THREE.Points
	{

		// let geometry = new THREE.CircleGeometry(radius, 64);

		let positions = this.generatePositions(radius);

		let geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

		let material = new THREE.PointsMaterial({
			// map: particleTexture,
			size: 0.1,
			color : 'white',
			opacity : 0.4,
			transparent: true
		});

		return new THREE.Points(geometry, material);

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