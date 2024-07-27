import {AxesHelper, Object3D, Vector3} from "three";
import * as THREE from "three";
import Attack from "../Attack";
import Hittable from "../../Contracts/Hittable";
import {Animation} from "../../../Three/Animation";

export default class LaserBulletAttack extends Attack
{

	public isMoving : boolean = true;

	public to : Vector3;

	public color : any;
	public glowColor : any;
	public length : number = 0;

	protected mesh : THREE.Mesh;
	protected glow : THREE.Sprite;

	protected maxDistanceShow : number = 150;
	protected maxDistanceDamage : number = 50;

	protected lastPosition : Vector3;

	constructor(
		from : Vector3,
		to : Vector3,
		force : number,
		color : any,
		glowColor : any
	) {

		super(from.clone(), force);

		this.to = to.clone();
		this.lastPosition = from.clone();
		this.color = color;
		this.glowColor = glowColor;

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
			color: this.glowColor, // Цвет свечения
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite:false
		});

		let glowSprite = new THREE.Sprite(glowMaterial);
		glowSprite.scale.set(2, 0.5, 0.5);

		return glowSprite;

	}


	protected createMesh(): THREE.Mesh
	{

		let mesh = new THREE.Mesh(
			new THREE.SphereGeometry(0.1, 10, 10),
			new THREE.MeshBasicMaterial({color : this.color})
		);

		mesh.scale.set(0.3, 1, 1);

		return mesh;

	}

	public stopMoving(){

		this.isMoving = false;

		this.position.set(this.position.x, this.position.y, 0);

	}


	public checkCollisionWith(object : THREE.Object3D) : boolean
	{

		let objectBox = new THREE.Box3().setFromObject(object);
		let bulletBox = new THREE.Box3().setFromObject(this);

		return bulletBox.intersectsBox(objectBox)

	}

	public boof(){

		(<THREE.MeshBasicMaterial>this.mesh.material).color.set('#757575');
		this.glow.material.color.set('#888888');
		this.glow.material.opacity = 0.2;
		this.glow.scale.set(8, 4, 4);

		this.stopMoving();

		setTimeout(() => this.hide(), 500);

	}

	public boom(){

		(<THREE.MeshBasicMaterial>this.mesh.material).color.set('#ffac70');
		this.glow.material.color.set('#ff8b33');
		this.glow.material.opacity = 0.2;
		this.glow.scale.set(4, 2, 2);

		this.stopMoving();

		setTimeout(() => this.hide(), 500);

	}


	public animate(
		peaceObjects : THREE.Object3D[] = [],
		enemiesObjects : Hittable[] = []
	){

		if(this.length > this.maxDistanceShow){
			this.hide();
		}else if(this.isMoving && this.length <= this.maxDistanceDamage){

			if(peaceObjects.some(object => this.checkCollisionWith(object))){
				this.boof();
			}

			//Столкновение с вражескими кораблями
			enemiesObjects.some(enemy => {

				if(this.checkCollisionWith(enemy)){

					this.boom();
					enemy.hit(this.force);

					return true;
				}

				return false;

			});

		}

		if(this.isVisible && this.isMoving){

			this.position.add(
				new Vector3().subVectors(this.to, this.position).normalize()
			);

			this.length = this.from.distanceTo(this.position);

		}

		this.lastPosition = this.position.clone();

	}



}