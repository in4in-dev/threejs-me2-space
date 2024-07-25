import Mob from "../Mob";
import * as THREE from "three";
import AttacksContainer from "../../Containers/AttacksContainer";
import ModelLoader from "../../../Three/ModelLoader";
import {Vector3} from "three";
import LaserBulletAttack from "../Attacks/LaserBulletAttack";
import Random from "../../../Three/Random";
import {Animation, AnimationThrottler} from "../../../Three/Animation";

export default class FriendHammerhead extends Mob
{

	protected mesh : THREE.Group | null = null;

	protected autoFireThrottler : AnimationThrottler = Animation.createThrottler(300);

	constructor(
		healths : number,
		x : number,
		y : number,
		speed : number,
		attacksContainer : AttacksContainer
	) {

		super(healths, x, y, speed, attacksContainer);

		this.mesh = this.createBody();

		//Добавляем на сцену
		this.add(this.mesh!);

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

	protected createBody() : THREE.Group
	{

		let group = new THREE.Group;

		let ship = new ModelLoader(
			'../../../../assets/mobs/hammerhead/hammerhead.obj',
			'../../../../assets/mobs/hammerhead/hammerhead.mtl'
		).loadInBackground();

		ship.scale.set(0.005, 0.005, 0.005);

		ship.rotation.x = 1.7;
		ship.rotation.y = Math.PI;

		let light = new THREE.PointLight('white', 2, 5);
		light.position.z = 2;
		light.position.y = 0;

		group.add(light);
		group.add(ship);

		return group;

	}

	public fire(to : Vector3){

		let bullet1 = new LaserBulletAttack(
			new Vector3(this.position.x + 0.3, this.position.y - 0.3, 0),
			to,
			Random.int(1, 5),
			'white',
			'#66bd4e'
		);

		let bullet2 = new LaserBulletAttack(
			new Vector3(this.position.x - 0.3, this.position.y - 0.3, 0),
			to,
			Random.int(1, 5),
			'white',
			'#66bd4e'
		);

		this.attacksContainer.addAttacks(bullet1, bullet2)

	}

	public altFire(to: Vector3) {

	}

}