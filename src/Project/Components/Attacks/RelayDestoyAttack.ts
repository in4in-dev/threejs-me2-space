import * as THREE from "three";
import {Vector3} from "three";
import Attack from "../Attack";
import Hittable from "../../Contracts/Hittable";

export default class RelayDestoyAttack extends Attack
{

	protected mesh : THREE.Points;

	protected explosionDuration : number = 5000;
	protected explosionStartTime : number = 0;
	protected explosionMaxRadius : number = 200;

	protected damagedEnemies : Hittable[] = [];

	constructor(
		from : Vector3,
		force : number
	) {

		super(from.clone(), force);

		this.explosionStartTime = Date.now();

		this.mesh = this.createMesh();

		this.add(this.mesh);

	}

	protected generateShieldGeometry(radius : number) : THREE.BufferGeometry
	{

		let points = [];
		for (let i = 0; i < 50000; i++) {
			let phi = Math.acos(2 * Math.random() - 1);
			let theta = 2 * Math.PI * Math.random();
			let x = radius * Math.sin(phi) * Math.cos(theta);
			let y = radius * Math.sin(phi) * Math.sin(theta);
			let z = radius * Math.cos(phi);
			points.push(new THREE.Vector3(x, y, z));
		}

		return new THREE.BufferGeometry().setFromPoints(points);

	}

	protected createMesh(): THREE.Points
	{

		let particleTexture = new THREE.TextureLoader().load('../../../../assets/sand.png');

		return new THREE.Points(
			this.generateShieldGeometry(0),
			new THREE.PointsMaterial({
				transparent : true,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				color : '#2289c4',
				// opacity: 0.25,
				size : 0.3 ,
				map : particleTexture
			})
		);

	}


	public animate(
		peaceObjects : THREE.Object3D[] = [],
		enemiesObjects : Hittable[] = []
	){


		//Анимируем щит
		let progress = (Date.now() - this.explosionStartTime) / this.explosionDuration;
		let radius = progress * this.explosionMaxRadius;

		if(progress >= 1) {

			this.hide();

		}else{

			let outSideSphere = this.generateShieldGeometry(radius);

			this.mesh.geometry.copy(outSideSphere);


			enemiesObjects.forEach(enemy => {

				if (
					this.damagedEnemies.indexOf(enemy) < 0 &&
					enemy.position.distanceTo(this.position) <= radius
				) {
					enemy.hit(this.force);
					this.damagedEnemies.push(enemy);
				}

			});

		}

	}


}