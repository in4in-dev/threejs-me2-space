import Component from "../Core/Component";
import * as THREE from 'three';
import Drop from "../Components/Drop";

export default class DropContainer<T extends THREE.Object3D, D extends Drop<T>> extends Component
{

	protected drops : D[] = [];

	protected whoCanUse : T[];

	constructor(whoCanUse : T[] = []) {
		super();
		this.whoCanUse = whoCanUse;
	}

	public addDrop(...drops : D[]){

		this.add(...drops);
		this.drops.push(...drops);

	}

	public updateWhoCanUse(whoCanUse : T[]){
		this.whoCanUse = whoCanUse;
	}

	public animate(){

		this.drops.forEach(heal => {

			this.whoCanUse.some(obj => {

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