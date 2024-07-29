import Attack from "../Attack";
import * as THREE from "three";
import {Object3D, Vector3} from "three";
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
	protected hitThrottler : AnimationThrottler = Animation.createThrottler(600);

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
		this.healTarget = healTarget;

		this.mesh = this.createLightnings([]);

		this.add(this.mesh);

	}

	protected createLightning(from : Vector3, to : Vector3) : THREE.Line
	{

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

		return new THREE.Line(
			new THREE.BufferGeometry().setFromPoints(points),
			new THREE.LineBasicMaterial({ color: this.color })
		);

	}

	protected hitEnemy(enemy : Hittable) : void
	{

		enemy.hit(this.force);

		if(this.healTarget){

			this.healTarget.heal(
				Math.ceil(this.force)
			);

		}

	}

	protected createLightnings(enemies : Hittable[], randomLightnings : number = 5) : THREE.Group
	{

		let group = new THREE.Group;

		let lines = enemies.map(enemy => {
			return this.createLightning(
				new Vector3(0, 0, 0),
				new Vector3().subVectors(enemy.position, this.from).setZ(-1)
			);
		});


		for(let i = 0; i < randomLightnings; i++){

			let randomDirection = new Vector3(
				Random.float(-2.5, 2.5),
				Random.float(-2.5, 2.5),
				-1
			)

			lines.push(
				this.createLightning(
					new Vector3(0, 0, 0),
					randomDirection
				)
			)
		}


		if(lines.length){
			group.add(...lines);
		}

		return group;

	}

	protected replaceMesh(mesh : THREE.Group) : void
	{
		this.remove(this.mesh);
		this.mesh = mesh;
		this.add(this.mesh);
	}

	public updateFrom(from : Vector3) : void
	{
		this.from = from.clone();
	}

	public animate(
		peaceObjects: Object3D[],
		enemies: Hittable[]
	){

		if(Date.now() < this.startTime + this.duration) {

			let availableEnemies = enemies
				.filter(enemy => enemy.position.distanceTo(this.from) <= this.radius);

			availableEnemies.forEach(enemy => {

				if (this.hitEnemies.indexOf(enemy) < 0) {

					this.hitEnemies.push(enemy);
					this.hitEnemy(enemy);

				}else{

					this.hitThrottler(() => this.hitEnemy(enemy));

				}

			});

			this.replaceMesh(
				this.createLightnings(availableEnemies)
			)

			this.position.copy(this.from);

		}else{
			this.hide();
		}

	}

}