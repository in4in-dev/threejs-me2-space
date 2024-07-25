import {Vector3} from "three";
import * as THREE from "three";
import Attack from "../Attack";
import Hittable from "../../Contracts/Hittable";

export default class RocketBulletAttack extends Attack
{

	public isExploded : boolean = false;

	public to : Vector3;

	protected mesh : THREE.Mesh;
	protected glow : THREE.Sprite;

	protected explosionTime : number = 2000;
	protected explosionStartTime : number = 0;
	protected explosionRadius : number = 0;
	protected explosionMaxRadius : number = 20;
	protected explosionPoint : Vector3 | null = null;

	protected damagedEnemies : Hittable[] = [];

	constructor(
		from : Vector3,
		to : Vector3,
		force : number
	) {

		super(from.clone(), force);

		this.to = to.clone();

		this.mesh = this.createMesh();
		this.glow = this.createGlow();

		//Добавляем на сцену
		// this.mesh.add(this.glow);
		this.add(this.mesh);

	}


	protected createGlow() : THREE.Sprite
	{

		let glowTexture = new THREE.TextureLoader().load('../../../../assets/glow.png');

		let glowMaterial = new THREE.SpriteMaterial({
			map: glowTexture,
			color: 'white',
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite:false
		});

		let glowSprite = new THREE.Sprite(glowMaterial);
		glowSprite.scale.set(2, 2, 2);

		return glowSprite;

	}


	protected createMesh(): THREE.Mesh
	{

		let mesh = new THREE.Mesh(
			new THREE.SphereGeometry(0.4, 10, 10),
			new THREE.MeshBasicMaterial({color : 'black' })
		);

		return mesh;

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
				explosionProgress = progress >= 0.5 ? (1 - progress) : progress;

			let radius = explosionProgress * this.explosionMaxRadius;

			let sphere = new THREE.SphereGeometry(radius, 50, 50);

			this.mesh.geometry.copy(sphere);

			this.explosionRadius = radius;

			//Раним врагов
			enemiesObjects.forEach(enemy => {

				if(
					this.damagedEnemies.indexOf(enemy) < 0 &&
					enemy.position.distanceTo(this.explosionPoint!) <= this.explosionRadius
				){
					console.log('Enemy hit');
					enemy.hit(this.force);
					this.damagedEnemies.push(enemy);
				}

			});

		}else{

			let direction = new Vector3().subVectors(this.to, this.position);

			if(direction.length() > 0.2) {

				//Летим до цели
				direction.normalize();

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