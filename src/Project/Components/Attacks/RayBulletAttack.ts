import * as THREE from "three";
import {Object3D, Vector3} from "three";
import Attack from "../Attack";
import Hittable from "../../Contracts/Hittable";
import {Animation, AnimationThrottler} from "../../../Three/Animation";
import HitBox from "../../Core/HitBox";

export default class RayBulletAttack extends Attack
{

	protected to : Vector3;

	protected color : any;
	protected createTime : number;
	protected duration : number = 400;
	protected speed : number = 200;

	protected mesh : THREE.Mesh;
	protected glow : THREE.Sprite;

	protected damageThrottler : AnimationThrottler = Animation.createThrottler(100);

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
		this.glow = this.createGlow();

		this.mesh.add(this.glow);

		this.add(this.mesh);

	}

	private createBody() : THREE.Mesh
	{

		return new THREE.Mesh(
			new THREE.CylinderGeometry(0.05, 0.05, 0, 32),
			new THREE.MeshBasicMaterial({ color: this.color, transparent : true, opacity : 0.5 })
		);

	}

	private createGlow() : THREE.Sprite
	{

		let glowSprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.TextureLoader().load('../../../../assets/glow.png'),
				opacity : 0,
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite:false
			})
		);

		glowSprite.scale.set(4, 2, 2);

		return glowSprite;

	}

	protected getRayProgress(): number
	{

		let progress = Date.now() - this.createTime;

		return Math.min(1, progress / this.speed);

	}


	protected noEffect() : void
	{
		this.glow.material.opacity = 0;
	}

	protected boomEffect() : void
	{
		this.glow.material.color.set('#ff8b33');
		this.glow.material.opacity = 1;
	}

	public updateTarget(to : Vector3) : void
	{
		this.to = to.clone();
	}

	public updateStartPoint(from : Vector3) : void
	{
		this.from = from.clone();
	}

	public animate(peaceObjects: Object3D[], enemies: Hittable[]): void {

		if(Date.now() - this.createTime > this.duration){
			this.hide();
		}else {

			this.noEffect();

			let progress = this.getRayProgress(),
				maxLength = this.from.distanceTo(this.to),
				length = progress * maxLength;

			let direction = new THREE.Vector3().subVectors(this.to, this.from).normalize();

			enemies.some(enemy => {

				let rayCaster = new THREE.Raycaster(
					this.from,
					direction.clone(),
					0,
					length
				);

				let enemyBox = HitBox.getFor(enemy, false);

				let vector = new Vector3();

				if(rayCaster.ray.intersectBox(enemyBox, vector)){

					length = Math.min(
						this.from.distanceTo(vector),
						length
					);

					this.damageThrottler(() => enemy.hit(this.force));
					this.boomEffect();

					return true;

				}

				return false;

			});


			this.mesh.geometry.copy(
				new THREE.CylinderGeometry(0.05, 0.05, length, 32)
			);

			this.position.copy(
				this.from.clone().add(
					this.to.clone().sub(this.from).multiplyScalar((length / maxLength) / 2)
				)
			);


			let quaternion = new THREE.Quaternion();
			quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());

			this.mesh.setRotationFromQuaternion(quaternion);

			this.glow.position.set(0, length / 2, 0);

		}

	}


}