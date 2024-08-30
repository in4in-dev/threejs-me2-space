import * as THREE from "three";
import {Vector3} from "three";
import Attack from "../Attack";
import Hittable from "../../Contracts/Hittable";
import GeometryGenerator from "../../../Three/GeometryGenerator";

export default class RelayDestroyAttack extends Attack
{

	protected mesh : THREE.Points;

	protected explosionStartTime : number = 0;
	protected explosionDuration : number = 5000;
	protected explosionMaxRadius : number = 200;

	protected damagedEnemies : Hittable[] = [];

	constructor(
		from : Vector3,
		force : number
	) {

		super(from, force);

		this.explosionStartTime = Date.now();

		this.mesh = this.createMesh();

		this.add(this.mesh);

	}

	private generateShieldGeometry(radius : number) : THREE.BufferGeometry
	{
		return GeometryGenerator.emptySphere(radius, 50000);
	}

	private createMesh(): THREE.Points
	{

		return new THREE.Points(
			this.generateShieldGeometry(0),
			new THREE.PointsMaterial({
				map : new THREE.TextureLoader().load('../../../../assets/sand.png'),
				transparent : true,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				color : '#2289c4',
				size : 0.3
			})
		);

	}


	public animate(
		peaceObjects : THREE.Object3D[] = [],
		enemiesObjects : Hittable[] = []
	){

		if(this.isVisible){

			let progress = (Date.now() - this.explosionStartTime) / this.explosionDuration;
			let radius = progress * this.explosionMaxRadius;

			if(progress >= 1) {
				this.hide();
			}else{

				let outSideSphere = this.generateShieldGeometry(radius);

				this.mesh.geometry.copy(outSideSphere);

				enemiesObjects.forEach(enemy => {

					if (
						!this.damagedEnemies.includes(enemy) &&
						enemy.position.distanceTo(this.position) <= radius
					) {
						enemy.hit(this.force);
						this.damagedEnemies.push(enemy);
					}

				});

			}

		}

	}


}