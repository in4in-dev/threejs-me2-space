import * as THREE from "three";
import {Vector3} from "three";
import Attack from "../Attack";
import Hittable from "../../Contracts/Hittable";
import HitBox from "../../Core/HitBox";

export default class LaserBulletAttack extends Attack
{

	protected mesh : THREE.Mesh;
	protected glow : THREE.Sprite;

	protected to : Vector3;

	protected isMoving : boolean = true;

	protected maxDistanceShow : number = 150;
	protected maxDistanceDamage : number = 50;

	constructor(
		from : Vector3,
		to : Vector3,
		force : number,
		color : any,
		glowColor : any
	) {

		super(from, force);

		this.to = to.clone();

		this.mesh = this.createMesh(color);
		this.glow = this.createGlow(glowColor);

		this.mesh.add(this.glow);

		this.add(this.mesh);

	}


	private createGlow(color : any) : THREE.Sprite
	{

		let glowSprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.TextureLoader().load('../../../../assets/glow.png'),
				color: color,
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite:false
			})
		);

		glowSprite.scale.set(2, 0.5, 0.5);

		return glowSprite;

	}

	private createMesh(color : any): THREE.Mesh
	{

		let mesh = new THREE.Mesh(
			new THREE.SphereGeometry(0.1, 10, 10),
			new THREE.MeshBasicMaterial({color : color})
		);

		let direction = new Vector3().subVectors(this.to, this.from);
		let angle = Math.atan2(direction.y, direction.x);

		mesh.rotation.z = angle + Math.PI / 2;

		mesh.scale.set(0.5, 3, 0.3);

		return mesh;

	}

	private checkCollisionWith(object : THREE.Object3D) : boolean
	{
		return HitBox.getFor(object, true).containsPoint(this.position);
	}

	protected boof() : void
	{

		(<THREE.MeshBasicMaterial>this.mesh.material).color.set('#757575');
		(<THREE.SpriteMaterial>this.glow.material).color.set('#888888');
		(<THREE.SpriteMaterial>this.glow.material).opacity = 0.2;

		this.glow.scale.set(8 / 0.5, 4 / 3, 4 / 0.3);

		this.isMoving = false;

		setTimeout(() => this.hide(), 500);

	}

	protected boom() : void
	{

		(<THREE.MeshBasicMaterial>this.mesh.material).opacity = 0;
		(<THREE.SpriteMaterial>this.glow.material).color.set('#ff8b33');
		(<THREE.SpriteMaterial>this.glow.material).opacity = 0.2;

		this.glow.scale.set(4, 2, 2);

		this.isMoving = false;

		setTimeout(() => this.hide(), 500);

	}


	public animate(
		peaceObjects : THREE.Object3D[] = [],
		enemiesObjects : Hittable[] = []
	){

		let length = this.from.distanceTo(this.position);

		if(length > this.maxDistanceShow){
			this.hide();
		}else if(this.isMoving && length <= this.maxDistanceDamage){

			if(peaceObjects.some(object => this.checkCollisionWith(object))){
				this.boof();
			}else {

				enemiesObjects.some(enemy => {

					if (this.checkCollisionWith(enemy)) {

						this.boom();
						enemy.hit(this.force);

						return true;
					}

					return false;

				});

			}

		}

		if(this.isVisible && this.isMoving){

			this.position.add(
				new Vector3().subVectors(this.to, this.position).normalize()
			);

		}

	}



}