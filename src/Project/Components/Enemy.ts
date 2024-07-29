import Mob from "./Mob";
import Random from "../../Three/Random";
import Heal from "./Drops/Heal";
import {Vector3} from "three";
import DropContainer from "../Containers/DropContainer";
import AttacksContainer from "./../Containers/AttacksContainer";
import Healthy from "../Contracts/Healthy";
import Experience from "./Drops/Experience";
import Experienced from "../Contracts/Experienced";

export default abstract class Enemy extends Mob
{

	protected healsContainer : DropContainer<Healthy, Heal>;
	protected expContainer : DropContainer<Experienced, Experience>

	constructor(
		health : number,
		speed : number,
		bulletsContainer : AttacksContainer,
		healsContainer : DropContainer<Healthy, Heal>,
		expContainer : DropContainer<Experienced, Experience>
	) {

		super(health, speed, bulletsContainer);

		this.healsContainer = healsContainer;
		this.expContainer = expContainer;

	}

	protected dropHeals(healths : number, count : number = 1){

		let step = healths / count, heals = [];

		for(let i = 0, c = healths; i < count; i++){

			let heal = new Heal(
				Math.min(c, step),
				Random.float(0.07, 0.11)
			);

			heal.position.copy(this.position).setZ(0);

			let direction = new Vector3(
				Random.float(-3, 3),
				Random.float(-3, 3),
				0
			);

			heal.startSpawnMoving(
				new Vector3().addVectors(this.position, direction).setZ(0)
			);

			heals.push(heal);

			c -= step;

		}

		this.healsContainer.addDrop(...heals);

	}

	protected dropExperience(exp : number, count : number = 1){

		let step = Math.ceil(exp / count), experiences = [];

		for(let i = 0, c = exp; i < count && c > 0; i++){

			let experience = new Experience(
				Math.min(c, step),
				Random.float(0.07, 0.11)
			);

			experience.position.copy(this.position).setZ(0);

			let direction = new Vector3(
				Random.float(-3, 3),
				Random.float(-3, 3),
				0
			);

			experience.startSpawnMoving(
				new Vector3().addVectors(this.position, direction).setZ(0)
			);

			experiences.push(experience);

			c -= step;

		}

		this.expContainer.addDrop(...experiences);

	}



	public hit(damage : number) : boolean
	{

		super.hit(damage);

		if(!this.health){

			this.dropHeals(
				Random.int(this.maxHealth * 0.5, this.maxHealth * 0.9),
				Random.int(5, 50)
			);

			this.dropExperience(
				Random.int(this.maxHealth * 0.6, this.maxHealth * 3),
				Random.int(5, 50)
			);

			return false;
		}

		return true;

	}


}