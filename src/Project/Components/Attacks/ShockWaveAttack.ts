import Attack from "../Attack";
import {Object3D, Vector3} from "three";
import * as THREE from 'three';
import Hittable from "../../Contracts/Hittable";
import Random from "../../../Three/Random";
import {Animation, AnimationThrottler} from "../../../Three/Animation";
import Healthy from "../../Contracts/Healthy";

export default class ShockWaveAttack extends Attack
{

	protected color : any;
	protected startTime : number;
	protected radius : number;
	protected duration : number;

	protected mesh : THREE.Group;

	protected hitEnemies : Hittable[] = [];
	protected hitThrottler : AnimationThrottler;

	protected healTarget : Healthy | null;

	constructor(
		from : Vector3,
		force : number,
		duration : number,
		radius : number,
		color : any,
		healTarget : Healthy | null = null
	) {
		super(from, force);

		this.color = color;
		this.radius = radius;
		this.duration = duration;
		this.startTime = Date.now();
		this.mesh = this.createBody();
		this.hitThrottler = Animation.createThrottler(600);
		this.healTarget = healTarget;

		this.add(this.mesh);

	}

	protected createBody() : THREE.Group
	{
		return new THREE.Group;
	}

	protected createLighting(from : Vector3, to : Vector3) : THREE.Line
	{

		let material = new THREE.LineBasicMaterial({ color: this.color });
		let points = [];
		let segments = 10;

		let deltaX = (to.x - from.x) / segments;
		let deltaY = (to.y - from.y) / segments;
		let deltaZ = (to.z - from.z) / segments;

		for (let i = 0; i <= segments; i++) {
			let x = from.x + deltaX * i + (Math.random() - 0.5) * 0.5;
			let y = from.y + deltaY * i + (Math.random() - 0.5) * 0.5;
			let z = from.z + deltaZ * i + (Math.random() - 0.5) * 0.5;
			points.push(new THREE.Vector3(x, y, z));
		}

		let geometry = new THREE.BufferGeometry().setFromPoints(points);
		let line = new THREE.Line(geometry, material);

		return line;

	}

	public updateFrom(from : Vector3){
		this.from = from.clone();
	}

	public animate(
		peaceObjects: Object3D[],
		enemies: Hittable[]
	){

		if(Date.now() < this.startTime + this.duration) {

			let group = this.createBody();

			let availableEnemies = enemies
				.filter(enemy => enemy.position.distanceTo(this.from) <= this.radius);

			availableEnemies.forEach(enemy => {

				let toDo = () => {

					enemy.hit(this.force);

					if(this.healTarget){
						this.healTarget.heal(
							Math.ceil(this.force)
						);
					}

				}

				if (this.hitEnemies.indexOf(enemy) < 0) {

					this.hitEnemies.push(enemy);

					toDo();

				}else{

					this.hitThrottler(toDo);

				}

			});

			let lines = availableEnemies.map(enemy => {
				return this.createLighting(
					new Vector3(0, 0, 0),
					new Vector3().subVectors(enemy.position, this.from).setZ(-1)
				);
			});

			for(let i = 0; i < 5; i++){

				let randomDirection = new Vector3(
					Random.float(-2.5, 2.5),
					Random.float(-2.5, 2.5),
					-1
				)

				lines.push(
					this.createLighting(
						new Vector3(0, 0, 0),
						randomDirection
					)
				)
			}

			if(lines.length){
				group.add(...lines);
			}

			this.remove(this.mesh);
			this.add(group);

			this.position.copy(this.from);

			this.mesh = group;

		}else{
			this.hide();
		}

	}

}