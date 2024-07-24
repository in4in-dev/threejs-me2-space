import {Object3D, Vector3} from "three";
import * as THREE from "three";
import Attack from "../Attack";
import Hittable from "../Hittable";
import Animation from "../../../Three/Animation";

export default class RayBulletAttack extends Attack
{

	protected to : Vector3;
	protected color : any;

	protected mesh : THREE.Mesh;
	protected createTime : number;

	protected speed : number = 200;

	protected damageThrottler = Animation.createThrottler(100);

	constructor(
		from : Vector3,
		to : Vector3,
		force : number,
		color : any
	) {
		super(from, force);

		this.to = to.clone();
		this.color = color;

		this.createTime = Date.now();
		this.mesh = this.createBody();

		this.add(this.mesh);

	}

	protected getRayProgress(): number
	{

		let progress = Date.now() - this.createTime;

		return Math.min(1, progress / this.speed);

	}

	protected createBody() : THREE.Mesh
	{

		let geometry = new THREE.CylinderGeometry(0.05, 0.05, 0, 32);
		let material = new THREE.MeshBasicMaterial({ color: this.color, transparent : true, opacity : 0.5 });
		let cylinder = new THREE.Mesh(geometry, material);

		return cylinder;

	}

	protected noEffect(){

	}

	protected boom(){

	}

	protected boof(){

	}

	public updateTarget(to : Vector3){
		this.to = to.clone();
	}

	public updateStartPoint(from : Vector3){
		this.from = from.clone();
	}

	public animate(peaceObjects: Object3D[], enemies: Hittable[]): void {

		if(Date.now() - this.createTime > this.speed + 200){
			this.hide();
		}else {

			this.noEffect();

			let direction = new THREE.Vector3().subVectors(this.from, this.to).normalize();

			let progress = this.getRayProgress(),
				length = progress * this.from.distanceTo(this.to);

			peaceObjects.some(obj => {
				//@TODO
			});

			enemies.some(enemy => {
				//@TODO
			});


			this.mesh.geometry.dispose();
			this.mesh.geometry = new THREE.CylinderGeometry(0.05, 0.05, length, 32);

			this.mesh.position.copy(
				this.from.clone().add(
					this.to.clone().sub(this.from).multiplyScalar(progress / 2)
				)
			);


			let quaternion = new THREE.Quaternion();
			quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());

			this.mesh.setRotationFromQuaternion(quaternion);


		}

	}


}