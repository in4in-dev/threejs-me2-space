import Component from "../Core/Component";
import * as THREE from 'three';
import Hittable from "./Hittable";
import Attack from "./Attack";

export default class AttacksContainer extends Component
{

	protected bullets : Attack[] = [];

	public addBullets(...bullets : Attack[]){

		this.bullets.push(...bullets);

		this.add(...bullets);

	}


	public animate(
		peaceObjects : THREE.Object3D[] = [],
		enemiesObjects : Hittable[] = []
	){

		this.bullets = this.bullets.filter(bullet => {

			bullet.animate(peaceObjects, enemiesObjects);

			if(!bullet.isVisible){
				this.remove(bullet);
				return false;
			}

			return true;

		});

	}


}