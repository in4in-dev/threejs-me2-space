import Enemy from "../Enemy";
import * as THREE from 'three';
import {Scene} from "three";
import ModelLoader from "../../../Three/ModelLoader";

export default class EnemyReaper extends Enemy
{

	public mesh : THREE.Group | null = null;

	public async load() : Promise<this>
	{

		await super.load();

		this.mesh = await this.createBody();
		this.add(this.mesh!);

		return this;

	}

	public async animate(): Promise<void>
	{

		//Движение до цели
		if(this.attackTarget){

			let distance = this.position.distanceTo(this.attackTarget!.position);

			if(distance > 10){

				this.moveTo(this.attackTarget!.position);

				if(distance > 20){
					this.setSpeed(0.05);
				}else{
					this.setSpeed(0.02);
				}

			}else{
				this.stop();
				this.rotateTo(this.attackTarget!.position);
			}


		}

		//Автоматический огонь
		await super.animate();

	}

	protected async createBody() : Promise<THREE.Group>
	{

		let group = new THREE.Group;

		let ship = await new ModelLoader('../../assets/reaper/reaper.obj', '../../assets/reaper/reaper.mtl').load();

		ship.children[0].material.color.set('black');

		ship.scale.set(0.05, 0.05, 0.05);

		ship.rotation.y = 4.7;
		ship.rotation.x = 0.3;

		ship.position.z = -1;
		ship.position.y = -3;


		let glow = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.TextureLoader().load('../../../../assets/glow.png'),
				color: 'red', // Цвет свечения
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite:false,
				opacity : 0.2
			})
		)

		glow.scale.set(2, 2, 2);
		glow.position.set(0, 0, -1);

		group.add(ship);
		group.add(glow);

		return group;

	}

}