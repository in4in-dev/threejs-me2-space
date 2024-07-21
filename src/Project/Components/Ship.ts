import * as THREE from 'three';
import {Vector3} from "three";
// @ts-ignore
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
// @ts-ignore
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import ShipEngine from "./ShipEngine.ts";
import ModelLoader from "../../Three/ModelLoader.ts";
import Component from "../Core/Component.ts";

interface ShipEngines
{
	r1 : ShipEngine,
	r2 : ShipEngine,
	l2 : ShipEngine,
	l1 : ShipEngine
}

export default class Ship extends Component
{

	public speed : number;

	public mesh : THREE.Mesh | null = null;
	public light : THREE.Light | null = null;
	public engines : ShipEngines | null = null;

	constructor(speed : number = 0.1) {
		super();
		this.speed = speed;
	}

	public async load() : Promise<this>
	{
		this.light = await this.createLight();
		this.engines = await this.createEngines();
		this.mesh = await this.createBody();

		return this;
	}

	public addTo(scene : THREE.Scene) : void
	{
		this.mesh!.add(this.light!);

		this.engines!.l2.addTo(this.mesh!);
		this.engines!.l1.addTo(this.mesh!);
		this.engines!.r2.addTo(this.mesh!);
		this.engines!.r1.addTo(this.mesh!);

		scene.add(this.mesh!);
	}

	protected async createLight() : Promise<THREE.Light>
	{

		let light = new THREE.PointLight('white', 1, 100);

		light.position.set(5, 5, 5);

		return light;

	}

	protected async createBody() : Promise<THREE.Mesh>
	{

		let ship = await new ModelLoader('../../assets/ship/ship.obj', '../../assets/ship/ship.mtl').load();

		ship.scale.set(0.15, 0.15, 0.15);

		ship.rotation.x = 1.5;
		ship.position.set(10, 10, 0);

		return ship;

	}

	protected async createEngines() : Promise<ShipEngines>
	{

		let engineLeft1 = await new ShipEngine('#0d4379', '#1d64a6', 0.4, 1.5).load(),
			engineLeft2 = await new ShipEngine('#0d4379', '#1d64a6', 0.4, 2).load(),
			engineRight1 = await new ShipEngine('#0d4379', '#1d64a6', 0.4, 1.5).load(),
			engineRight2 = await new ShipEngine('#0d4379', '#1d64a6', 0.4, 2).load();

		engineRight1.mesh!.position.set(-5, -2 ,-4);
		engineRight2.mesh!.position.set(-3, -2 ,-4);

		engineLeft1.mesh!.position.set(5, -2, -4);
		engineLeft2.mesh!.position.set(3, -2, -4);

		return {
			l1 : engineLeft1,
			l2 : engineLeft2,
			r2 : engineRight2,
			r1 : engineRight1
		}

	}

	public moveTo(cords : Vector3){

		let direction = new THREE.Vector3().subVectors(cords, this.mesh!.position);

		if (direction.length() > 0.1) {

			direction.normalize();

			this.mesh!.position.add(
				direction.multiplyScalar(this.speed)
			);

			// Вычислить угол поворота
			let angle = Math.atan2(direction.y, direction.x);

			this.mesh!.rotation.y = angle + Math.PI / 2;


		}

	}

	public startEngines() : void
	{

		this.engines!.l1.setLength(8).setSpeed(1);
		this.engines!.r1.setLength(8).setSpeed(1);

		this.engines!.l2.setLength(10).setSpeed(1);
		this.engines!.r2.setLength(10).setSpeed(1);

	}

	public stopEngines() : void
	{

		this.engines!.l1.setLength(1.5).setSpeed(0.4);
		this.engines!.r1.setLength(1.5).setSpeed(0.4);

		this.engines!.l2.setLength(2).setSpeed(0.4);
		this.engines!.r2.setLength(2).setSpeed(0.4);

	}

	public animateEngines(){

		this.engines!.r1.animate();
		this.engines!.r2.animate();
		this.engines!.l1.animate();
		this.engines!.l2.animate();

	}

}