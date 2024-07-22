import * as THREE from 'three';
// @ts-ignore
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
// @ts-ignore
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import Ship from "./Ship.ts";
import Bullet from "./Bullet.ts";


export default class WarShip extends Ship
{

	public bullets : Bullet[] = [];
	public bulletsGroup : THREE.Group | null = null;

	public async load(): Promise<this>{

		await super.load();

		this.bulletsGroup = this.createFires();

		return this;

	}

	public addTo(scene : THREE.Scene)
	{

		super.addTo(scene);

		scene.add(this.bulletsGroup!);

	}

	protected createFires() : THREE.Group
	{
		return new THREE.Group();
	}

	public async fire(){

		let to = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh!.quaternion).multiplyScalar(0.5);

		let bullet1 = await new Bullet(
			this.mesh!.position.x + 0.3,
			this.mesh!.position.y - 0.3,
			to.x,
			to.y
		).load();

		let bullet2 = await new Bullet(
			this.mesh!.position.x - 0.3,
			this.mesh!.position.y - 0.3,
			to.x,
			to.y
		).load();

		bullet1.addTo(this.bulletsGroup!);
		bullet2.addTo(this.bulletsGroup!);

		this.bullets.push(bullet1);
		this.bullets.push(bullet2);

	}

	public animateBullets(boofable : THREE.Object3D[], boomable : THREE.Object3D[]){

		this.bullets = this.bullets.filter(bullet => {

			if(bullet.length > 100){
				bullet.isVisible = false;
			}else if(bullet.isMoving){

				if(boofable.some(object => bullet.checkCollisionWith(object))){
					return bullet.boof(), true;
				}else if(boomable.some(object => bullet.checkCollisionWith(object))){
					return bullet.boom(), true;
				}

			}

			if(bullet.isVisible) {

				if(bullet.isMoving) {
					bullet.animate();
				}

				return true;

			}else{

				this.bulletsGroup!.remove(bullet.mesh!);

				return false;

			}

		});

	}

}