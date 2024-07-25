import Mob from "./Mob";
import Random from "../../Three/Random";
import Heal from "./Heal";
import {Vector3} from "three";
import HealsContainer from "./HealsContainer";
import AttacksContainer from "./AttacksContainer";

export default abstract class Enemy extends Mob
{

	protected healsContainer : HealsContainer;

	constructor(
		health : number,
		startX : number = 0,
		startY : number = 0,
		speed : number,
		bulletsContainer : AttacksContainer,
		healsContainer : HealsContainer
	) {

		super(health, startX, startY, speed, bulletsContainer);

		this.healsContainer = healsContainer;

	}

	protected dropHealths(healths : number, count : number = 1){

		let step = healths / count, heals = [];

		for(let i = 0, c = healths; i < count; i++){

			let heal = new Heal(
				Math.min(c, step)
			);

			let position = this.position.clone().setZ(0);

			heal.position.copy(position);

			let direction = new Vector3(
				Random.int(-3, 3),
				Random.int(-3, 3),
				0
			);

			heal.setMovingTarget(
				position.add(direction).setZ(0)
			);

			heals.push(heal);

			c -= step;

		}

		this.healsContainer.dropHeals(...heals);

	}


	public hit(damage : number) : boolean
	{

		super.hit(damage);

		if(!this.health){

			this.dropHealths(
				Random.int(50, 200),
				Random.int(5, 30)
			);

			return false;
		}

		return true;

	}


}