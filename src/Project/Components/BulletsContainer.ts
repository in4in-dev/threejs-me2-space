import Component from "../Core/Component";
import * as THREE from 'three';
import Bullet from "./Bullet";
import Enemy from "./Enemy";
import Hittable from "./Hittable";
import {Object3D} from "three";

export default class BulletsContainer<B extends Bullet = Bullet> extends Component
{

	protected bullets : B[] = [];

	public addBullets(...bullets : B[]){

		this.bullets.push(...bullets);

		this.add(...bullets);

	}


	public async animate(
		peaceObjects : THREE.Object3D[] = [],
		enemiesObjects : Hittable[] = [],
		maxDistanceDamage : number = 80,
		maxDistanceShow : number = 150
	){

		//Проверяем столкновение пуль с объектами
		this.bullets = this.bullets.filter(bullet => {

			if(bullet.length > maxDistanceShow){
				//Если пуля улетела за 200, то просто удаляем ее
				bullet.hide();
			}else if(bullet.isMoving && bullet.length <= maxDistanceDamage){

				if(peaceObjects.some(object => bullet.checkCollisionWith(object))){
					bullet.boof();
				}

				//Столкновение с вражескими кораблями
				enemiesObjects.some(enemy => {

					if(bullet.checkCollisionWith(enemy)){

						bullet.boom();
						enemy.hit(bullet.force);

						return true;
					}

					return false;

				});

			}

			if(bullet.isVisible){

				if(bullet.isMoving){
					bullet.animate();
				}

				return true;

			}else{

				this.remove(bullet);

				return false;

			}


		});

	}


}