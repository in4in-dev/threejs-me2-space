import Component from "../Core/Component";
import * as THREE from 'three';
import Hittable from "../Contracts/Hittable";
import Attack from "./../Components/Attack";

export default class AttacksContainer extends Component
{

	protected attacks : Attack[] = [];

	public addAttacks(...bullets : Attack[]){

		this.attacks.push(...bullets);

		this.add(...bullets);

	}


	public animate(
		peaceObjects : THREE.Object3D[] = [],
		enemiesObjects : Hittable[] = []
	){

		this.attacks = this.attacks.filter(bullet => {

			if(!bullet.isVisible){
				this.remove(bullet);
				return false;
			}else{
				bullet.animate(peaceObjects, enemiesObjects);
				return true;
			}


		});

	}


}