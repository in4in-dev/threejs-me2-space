import {Vector3} from "three";
import * as THREE from "three";
import Attack from "../Attack";
import Hittable from "../../Contracts/Hittable";

export default class RocketBulletAttack extends Attack
{

	public isExploded : boolean = false;

	public to : Vector3;

	protected outsideMesh : THREE.Mesh;
	protected insideMesh : THREE.Mesh;
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

		this.outsideMesh = this.createOutsideMesh();
		this.insideMesh = this.createInsideMesh();
		this.glow = this.createGlow();

		//Добавляем на сцену
		// this.mesh.add(this.glow);
		this.add(this.insideMesh);
		this.add(this.outsideMesh);

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


	protected createOutsideMesh(): THREE.Mesh
	{

		let mesh = new THREE.Mesh(
			new THREE.SphereGeometry(0.4, 10, 10),
			new THREE.MeshStandardMaterial({color : 'black', side : THREE.BackSide })
		);

		return mesh;

	}

	protected createInsideMesh(): THREE.Mesh
	{

		let mesh = new THREE.Mesh(
			new THREE.SphereGeometry(0.2, 10, 10),
			new THREE.MeshBasicMaterial({color : '#000000' })
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

			let outSideSphere = new THREE.SphereGeometry(radius, 50, 50);
			let inSideSphere = new THREE.SphereGeometry(radius * 0.8, 50, 50);

			this.outsideMesh.geometry.copy(outSideSphere);
			this.insideMesh.geometry.copy(inSideSphere);

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