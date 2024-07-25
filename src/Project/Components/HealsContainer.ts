import Component from "../Core/Component";
import * as THREE from 'three';
import {Vector3} from "three";
import Heal from "./Heal";
import Healthy from "./Healthy";

export default class HealsContainer extends Component
{

	protected heals : Heal[] = [];

	constructor() {
		super();
	}

	public dropHeals(...healths : Heal[]){

		this.add(...healths);
		this.heals.push(...healths);

	}

	public animate(canBeHealed : Healthy[] = []){

		this.heals.forEach(heal => {

			canBeHealed.some(obj => {

				let distance = heal.position.distanceTo(obj.position);

				if(distance < 5){

					if(distance < 2){
						obj.heal(heal.healths);
						heal.used();
					}else{
						heal.setMovingTarget(obj.position)
					}

					return true;

				}else{

					// heal.clearMovingTarget();

					return false;

				}

			});

		});

		//Удаляем лишние
		this.heals = this.heals.filter(heal => {

			if(heal.isUsed){
				this.remove(heal);
				return false;
			}else{
				heal.animate();
				return true;
			}


		});

	}

}