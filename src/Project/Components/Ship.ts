import * as THREE from 'three';
import {Vector3} from "three";
// @ts-ignore
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
// @ts-ignore
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import Component from "../Core/Component";

export default class Ship extends Component
{

	public speed : number;

	constructor(x : number = 10, y : number = 10, speed : number = 0.1) {

		super();

		this.speed = speed;

		this.position.set(x, y, 0);

	}

	public setSpeed(speed : number){
		this.speed = speed;
	}

	public stop(){
		this.moveToFast(this.position.x, this.position.y);
	}

	public moveToFast(x : number, y : number)
	{
		this.position.x = x;
		this.position.y = y;
	}

	public rotateTo(cords : Vector3){

		let direction = new THREE.Vector3().subVectors(cords, this.position);

		// Вычислить угол поворота
		let angle = Math.atan2(direction.y, direction.x);

		this.rotation.z = angle + Math.PI / 2;

	}

	public moveTo(cords : Vector3){

		let direction = new THREE.Vector3().subVectors(cords, this.position);

		if (direction.length() > 0.1) {

			direction.normalize();

			this.position.add(
				direction.multiplyScalar(this.speed)
			);

			this.rotateTo(cords);

		}

	}

}