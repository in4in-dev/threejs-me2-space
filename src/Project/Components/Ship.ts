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

	public group : THREE.Group | null = null;

	protected startX : number;
	protected startY : number;

	constructor(x : number = 10, y : number = 10, speed : number = 0.1) {

		super();

		this.speed = speed;
		this.startX = x;
		this.startY = y;

	}

	public async load() : Promise<this>
	{
		this.group = await this.createGroup();

		return this;
	}

	public addTo(scene : THREE.Scene) : void
	{
		scene.add(this.group!);
	}

	public setSpeed(speed : number){
		this.speed = speed;
	}

	public stop(){
		this.moveToFast(this.group!.position.x, this.group!.position.y);
	}

	protected async createGroup() : Promise<THREE.Group>
	{

		let group = new THREE.Group();

		group.position.set(this.startX, this.startY, 0);

		return group;

	}

	public moveToFast(x : number, y : number)
	{
		this.group!.position.x = x;
		this.group!.position.y = y;
	}

	public rotateTo(cords : Vector3){

		let direction = new THREE.Vector3().subVectors(cords, this.group!.position);

		// Вычислить угол поворота
		let angle = Math.atan2(direction.y, direction.x);

		this.group!.rotation.z = angle + Math.PI / 2;

	}

	public moveTo(cords : Vector3){

		let direction = new THREE.Vector3().subVectors(cords, this.group!.position);

		if (direction.length() > 0.1) {

			direction.normalize();

			this.group!.position.add(
				direction.multiplyScalar(this.speed)
			);

			this.rotateTo(cords);

		}

	}

}