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

		console.log('Quaternion:', this.group!.quaternion);

		let to = new THREE.Vector3(0, -1, 0).applyQuaternion(this.group!.quaternion).multiplyScalar(0.5);

		let bullet1 = await new Bullet(
			this.group!.position.x + 0.3,
			this.group!.position.y - 0.3,
			to.x,
			to.y,
			THREE.MathUtils.randInt(1, 5)
		).load();

		let bullet2 = await new Bullet(
			this.group!.position.x - 0.3,
			this.group!.position.y - 0.3,
			to.x,
			to.y,
			THREE.MathUtils.randInt(1, 5)
		).load();

		bullet1.addTo(this.bulletsGroup!);
		bullet2.addTo(this.bulletsGroup!);

		this.bullets.push(bullet1);
		this.bullets.push(bullet2);

	}

	public clearBullets(){

		this.bullets = this.bullets.filter(bullet => {

			if(!bullet.isVisible){
				this.bulletsGroup!.remove(bullet.mesh!);
				return false;
			}

			return true;

		});

	}

}