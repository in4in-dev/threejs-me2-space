import * as THREE from "three";
import {Vector3} from "three";
import Attack from "../Attack";
import Hittable from "../../Contracts/Hittable";
import Sparks from "../Sparks";

export default class RocketBulletAttack extends Attack
{

	protected to : Vector3;

	protected mesh : THREE.Group;
	protected glow : THREE.Sprite;

	protected isExploded : boolean = false;

	protected explosionTime : number = 4000;
	protected explosionStartTime : number = 0;
	protected explosionRadius : number = 15;
	protected explosionPoint : Vector3 | null = null;

	protected addictiveSpeed : number = 0.06;
	protected addictiveRadius : number = 25;

	protected damagedEnemies : Hittable[] = [];

	constructor(
		from : Vector3,
		to : Vector3,
		force : number,
		radius : number
	) {

		super(from, force);

		this.to = to.clone();
		this.explosionRadius = radius;

		this.mesh = this.createMesh();
		this.glow = this.createGlow();

		//Добавляем на сцену
		this.mesh.add(this.glow);

		this.add(this.mesh);

	}


	private createGlow() : THREE.Sprite
	{

		return new THREE.Sprite(new THREE.SpriteMaterial({
			map: new THREE.TextureLoader().load('../../../../assets/glow.png'),
			color: '#da5c18',
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite:false
		}));

	}


	private createMesh(): THREE.Group
	{

		let group = new THREE.Group;

		let sparks = new Sparks(1, 'white', 0.1);

		let sphere = new THREE.Mesh(
			new THREE.SphereGeometry(0.5, 10, 10),
			new THREE.MeshBasicMaterial({color : 'black', transparent : true, opacity : 0.7})
		)

		group.add(sphere, sparks);

		group.scale.set(0.1, 0.1, 0.1);

		return group;

	}

	public boom() : void
	{

		this.isExploded = true;
		this.explosionStartTime = Date.now();
		this.explosionPoint = this.position.clone();

		setTimeout(() => this.hide(), this.explosionTime);

	}

	public updateTarget(x : Vector3) : void
	{
		this.to = x.clone();
	}

	public animate(
		peaceObjects : THREE.Object3D[] = [],
		enemiesObjects : Hittable[] = []
	){

		if(this.isExploded) {

			let progress = (Date.now() - this.explosionStartTime) / this.explosionTime,
				explosionProgress = progress >= 0.5 ? (1 - progress) : progress,
				damageMultiplier = (1 - progress);

			let radius = explosionProgress * this.explosionRadius;

			this.mesh.scale.set(radius , radius, radius);
			this.glow.scale.set(radius * 0.5, radius * 0.5, radius * 0.5);

			//Раним врагов
			enemiesObjects.forEach(enemy => {

				let distance = enemy.position.distanceTo(this.explosionPoint!);

				if(!this.damagedEnemies.includes(enemy) && distance <= radius){

					enemy.hit(Math.ceil(this.force * damageMultiplier));

					this.damagedEnemies.push(enemy);

				}

				//Затягиваем в центр
				if(distance <= this.addictiveRadius){

					let direction = new Vector3().subVectors(this.explosionPoint!, enemy.position);

					if(direction.length() > 0.1){

						direction.normalize().setZ(0);

						enemy.position.add(
							direction.multiplyScalar(this.addictiveSpeed)
						);

					}

				}


			});

		}else{

			let direction = new Vector3().subVectors(this.to, this.position);

			if(direction.length() > 0.2) {

				//Летим до цели
				if(direction.length() >= 2){
					direction.normalize();
				}

				this.position.add(
					direction.multiplyScalar(0.2)
				);

			}else{

				this.boom();

			}

		}

	}





}