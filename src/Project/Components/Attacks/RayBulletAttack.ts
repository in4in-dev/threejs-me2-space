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
	protected glow : THREE.Sprite;
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
		this.glow = this.createGlow();

		this.mesh.add(this.glow);

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

	protected createGlow() : THREE.Sprite
	{

		let glowTexture = new THREE.TextureLoader().load('../../../../assets/glow.png');

		let glowMaterial = new THREE.SpriteMaterial({
			map: glowTexture,
			opacity : 0,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite:false
		});

		let glowSprite = new THREE.Sprite(glowMaterial);
		glowSprite.scale.set(4, 2, 2);

		return glowSprite;

	}

	protected noEffect(){
		this.glow.material.opacity = 0;
	}

	protected boom(){
		this.glow.material.color.set('#ff8b33');
		this.glow.material.opacity = 1;
	}

	protected boof(){
		this.glow.material.color.set('gray');
		this.glow.material.opacity = 1;
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

			let progress = this.getRayProgress(),
				maxLength = this.from.distanceTo(this.to),
				length = progress * maxLength;

			let direction = new THREE.Vector3().subVectors(this.from, this.to).normalize();

			let boofed = peaceObjects.some(obj => {

				let raycastler = new THREE.Raycaster(this.from, direction.clone().multiplyScalar(-1), 0, length);
				let enemyBox = new THREE.Box3().setFromObject(obj);

				let vector = new Vector3();

				if(raycastler.ray.intersectBox(enemyBox, vector)){

					length = Math.min(
						this.from.distanceTo(vector),
						length
					);

					this.boof();

					return true;

				}

				return false;

			});

			boofed || enemies.some(enemy => {

				let raycastler = new THREE.Raycaster(this.from, direction.clone().multiplyScalar(-1), 0, length);
				let enemyBox = new THREE.Box3().setFromObject(enemy);

				let vector = new Vector3();

				if(raycastler.ray.intersectBox(enemyBox, vector)){

					length = Math.min(
						this.from.distanceTo(vector),
						length
					);

					this.damageThrottler(() => enemy.hit(this.force));

					this.boom();

					return true;

				}

				return false;

			});


			this.mesh.geometry.dispose();
			this.mesh.geometry = new THREE.CylinderGeometry(0.05, 0.05, length, 32);

			this.mesh.position.copy(
				this.from.clone().add(
					this.to.clone().sub(this.from).multiplyScalar((length / maxLength) / 2)
				)
			);


			let quaternion = new THREE.Quaternion();
			quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());

			this.mesh.setRotationFromQuaternion(quaternion);

			this.glow.position.set(0, -length / 2, 0);

		}

	}


}