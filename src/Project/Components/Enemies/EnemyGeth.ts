import * as THREE from 'three';
import {Vector3} from 'three';
import ModelLoader from "../../../Three/ModelLoader";
import AttacksContainer from "../../Containers/AttacksContainer";
import RayBulletAttack from "../Attacks/RayBulletAttack";
import DropContainer from "../../Containers/DropContainer";
import Enemy from "../Enemy";
import Healthy from "../../Contracts/Healthy";
import Heal from "../Drops/Heal";
import Experienced from "../../Contracts/Experienced";
import Experience from "../Drops/Experience";
import LaserBulletAttack from "../Attacks/LaserBulletAttack";
import {Animation, AnimationThrottler} from "../../../Three/Animation";

export default class EnemyGeth extends Enemy
{

	public level : number = 1;

	protected mesh : THREE.Object3D;
	protected autoFireThrottler : AnimationThrottler = Animation.createThrottler(300);
	protected autoFireMinDistance : number = 20;

	constructor(
		level : number,
		attacksContainer : AttacksContainer,
		healsContainer : DropContainer<Healthy, Heal>,
		expContainer : DropContainer<Experienced, Experience>
	) {

		super(50 * level, 0.05, attacksContainer, healsContainer, expContainer);

		this.level = level;

		this.mesh = this.createBody();

		//Добавляем на сцену
		this.add(this.mesh!);

	}

	private createBody() : THREE.Object3D
	{

		let light = new THREE.PointLight('white', 30, 10);

		light.position.set(0, -1, 4);

		let ship = new ModelLoader(
			'../../../assets/mobs/geth/geth.obj',
			'../../../assets/mobs/geth/geth.mtl'
		).loadInBackground();

		ship.rotation.x = 1.1;

		let group = new THREE.Group;

		group.scale.set(0.5, 0.5, 0.5);
		group.add(ship, light);

		return group;

	}

	public fire(to : Vector3) : void
	{

		this.attacksContainer.addAttacks(
			new LaserBulletAttack(
				this.position,
				new Vector3().subVectors(to, this.position).multiplyScalar(9999),
				10 * this.level,
				'white',
				'red'
			)
		);

	}

	public animate()
	{

		if(this.attackTarget){

			//Движение до цели
			let distance = this.position.distanceTo(this.attackTarget.position);

			if(distance > 10){

				this.moveTo(this.attackTarget.position);

				if(distance > 20){
					this.setSpeed(0.17);
				}else{
					this.setSpeed(0.1);
				}

			}else{
				this.rotateTo(this.attackTarget.position);
			}


		}

		//Автоматический огонь
		super.animate();

	}


}