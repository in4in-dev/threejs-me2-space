import {Vector3} from "three";
import * as THREE from "three";
import Attack from "../Attack";
import Hittable from "../../Contracts/Hittable";
import Sparks from "../Sparks";

export default class RocketBulletAttack extends Attack
{

	public isExploded : boolean = false;

	public to : Vector3;

	protected mesh : THREE.Group;
	protected glow : THREE.Sprite;

	protected explosionTime : number = 2000;
	protected explosionStartTime : number = 0;
	protected explosionRadius : number = 0;
	protected explosionMaxRadius : number = 15;
	protected explosionPoint : Vector3 | null = null;

	protected damagedEnemies : Hittable[] = [];

	constructor(
		from : Vector3,
		to : Vector3,
		force : number,
		radius : number
	) {

		super(from.clone(), force);

		this.to = to.clone();
		this.explosionMaxRadius = radius;

		this.mesh = this.createMesh();
		this.glow = this.createGlow();

		//Добавляем на сцену
		this.mesh.add(this.glow);
		this.add(this.mesh);

	}


	protected createGlow() : THREE.Sprite
	{

		let glowTexture = new THREE.TextureLoader().load('../../../../assets/glow.png');

		let glowMaterial = new THREE.SpriteMaterial({
			map: glowTexture,
			color: '#da5c18',
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite:false
		});

		return new THREE.Sprite(glowMaterial);

	}


	protected createMesh(): THREE.Group
	{

		let group = new THREE.Group;

		let sparks = new Sparks(1, 'white', 0.1);

		group.add(sparks);

		let sphere = new THREE.Mesh(
			new THREE.SphereGeometry(0.5, 10, 10),
			new THREE.MeshBasicMaterial({color : 'black', transparent : true, opacity : 0.7})
		)

		group.add(sphere);

		group.scale.set(0.1, 0.1, 0.1);

		return group;

	}

	public boom(){

		this.isExploded = true;
		this.explosionStartTime = Date.now();
		this.explosionPoint = this.position.clone();

		setTimeout(() => this.hide(), this.explosionTime);

	}


	public animate(
		peaceObjects : THREE.Object3D[] = [],
		enemiesObjects : Hittable[] = []
	){

		if(this.isExploded) {

			//Анимируем рост сферы
			let progress = (Date.now() - this.explosionStartTime) / this.explosionTime,
				explosionProgress = progress >= 0.5 ? (1 - progress) : progress,
				damageMultiplier = (1 - progress);

			let radius = explosionProgress * this.explosionMaxRadius;

			this.mesh.scale.set(radius , radius, radius);
			this.glow.scale.set(radius * 0.5, radius * 0.5, radius * 0.5);

			this.explosionRadius = radius;

			//Раним врагов
			enemiesObjects.forEach(enemy => {

				if(
					this.damagedEnemies.indexOf(enemy) < 0 &&
					enemy.position.distanceTo(this.explosionPoint!) <= this.explosionRadius
				){
					enemy.hit(Math.ceil(this.force * damageMultiplier));
					this.damagedEnemies.push(enemy);
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

	public updateTo(x : Vector3)
	{
		this.to = x.clone();
	}



}