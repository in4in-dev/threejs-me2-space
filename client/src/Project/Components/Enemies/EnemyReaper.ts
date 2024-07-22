import Enemy from "../Enemy.ts";
import * as THREE from 'three';
import {Scene} from "three";
import ModelLoader from "../../../Three/ModelLoader.ts";

export default class EnemyReaper extends Enemy
{

	public mesh : THREE.Group | null = null;

	public async load() : Promise<this>
	{

		await super.load();

		this.mesh = await this.createBody();

		return this;

	}

	public addTo(scene : Scene)
	{

		this.group!.add(this.mesh!);

		super.addTo(scene);

	}

	protected async createBody() : Promise<THREE.Group>
	{

		let group = new THREE.Group;

		let ship = await new ModelLoader('../../assets/reaper/reaper.obj', '../../assets/reaper/reaper.mtl').load();

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