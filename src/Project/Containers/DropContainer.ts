import Component from "../Core/Component";
import * as THREE from 'three';
import Heal from "./../Components/Heal";
import Healthy from "../Contracts/Healthy";
import Drop from "../Components/Drop";

export default class DropContainer<T extends THREE.Object3D, D extends Drop<T>> extends Component
{

	protected drops : D[] = [];

	public addDrop(...drops : D[]){

		this.add(...drops);
		this.drops.push(...drops);

	}

	public animate(canBeHealed : T[] = []){

		this.drops.forEach(heal => {

			canBeHealed.some(obj => {

				let distance = heal.position.distanceTo(obj.position);

				if(distance < 5){

					heal.setMovingTarget(obj);

					return true;

				}else{

					// heal.clearMovingTarget();

					return false;

				}

			});

		});

		//Удаляем лишние
		this.drops = this.drops.filter(heal => {

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