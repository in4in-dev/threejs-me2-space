import Mob from "../Mob";
import * as THREE from "three";
import {Vector3} from "three";
import AttacksContainer from "../../Containers/AttacksContainer";
import ModelLoader from "../../../Three/ModelLoader";
import LaserBulletAttack from "../Attacks/LaserBulletAttack";
import Random from "../../../Three/Random";
import {Animation, AnimationThrottler} from "../../../Three/Animation";

export default class FriendHammerhead extends Mob
{

	public level : number;

	protected mesh : THREE.Group;

	protected autoFireMinDistance : number = 50;
	protected autoFireThrottler : AnimationThrottler = Animation.createThrottler(300);

	constructor(
		level : number,
		attacksContainer : AttacksContainer
	) {

		super(level * 300 * level, 0.1, attacksContainer);

		this.level = level;
		this.mesh = this.createBody();

		//Добавляем на сцену
		this.add(this.mesh!);

	}


	protected createBody() : THREE.Group
	{

		let ship = new ModelLoader(
			'../../../../assets/mobs/hammerhead/hammerhead.obj',
			'../../../../assets/mobs/hammerhead/hammerhead.mtl'
		).loadInBackground();

		ship.scale.set(0.005, 0.005, 0.005);
		ship.rotation.set(1.7, Math.PI, 0);

		let light = new THREE.PointLight('white', 2, 5);
		light.position.set(0, 2, 0);

		let group = new THREE.Group;

		group.add(light, ship);

		return group;

	}

	protected createAttack(x : number, to : Vector3) : LaserBulletAttack
	{

		return new LaserBulletAttack(
			new Vector3(this.position.x + x, this.position.y - 0.3, 0),
			new Vector3().subVectors(to, this.position).multiplyScalar(9999),
			Random.int(this.level, this.level * 5),
			'white',
			'#66bd4e'
		);

	}

	public fire(to : Vector3){

		this.attacksContainer.addAttacks(
			this.createAttack(0.3, to),
			this.createAttack(-0.3, to)
		);

	}

	public animate()
	{

		// Движение до цели
		if(this.attackTarget){

			let distance = this.position.distanceTo(this.attackTarget.position);

			if(distance > 10){

				this.moveTo(this.attackTarget.position);

				if(distance > 20){
					this.setSpeed(0.1);
				}else{
					this.setSpeed(0.04);
				}

			}else{
				this.stop();
				this.rotateTo(this.attackTarget.position);
			}


		}

		//Автоматический огонь
		super.animate();

	}


}