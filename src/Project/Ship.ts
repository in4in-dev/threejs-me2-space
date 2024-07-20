import * as THREE from 'three';
import {Vector3} from "three";
// @ts-ignore
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
// @ts-ignore
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import ShipEngine from "./ShipEngine.ts";
import ModelLoader from "../Three/ModelLoader.ts";

export default class Ship
{

	public speed : number;
	public mesh : THREE.Mesh | null = null;
	public light : THREE.Light;

	public engines : ShipEngine[];

	constructor(speed : number = 0.1) {
		this.speed = speed;
		this.light = this.createLight();
		this.engines = this.createEngines();
	}

	public async load(){
		this.mesh = await this.createBody();
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

	public addToScene(scene : THREE.Scene) : void
	{
		this.mesh!.add(this.light);

		this.engines.forEach(engine => engine.addToMesh(this.mesh!));

		scene.add(this.mesh!);
	}

	protected createLight() : THREE.Light
	{

		let light = new THREE.PointLight('white', 1, 100);

		light.position.set(5, 5, 5);

		return light;

	}

	protected async createBody() : Promise<THREE.Mesh>
	{

		let ship = await new ModelLoader('../../ship.obj', '../../ship.mtl').load();

		ship.scale.set(0.15, 0.15, 0.15);

		ship.rotation.x = 1.5;
		ship.position.set(10, 10, 0);

		return ship;

	}

	protected createEngines() : ShipEngine[]
	{

		let engineLeft1 = new ShipEngine('#0d4379', '#1d64a6', 0.4, 1.5),
			engineLeft2 = new ShipEngine('#0d4379', '#1d64a6', 0.4, 2),
			engineRight1 = new ShipEngine('#0d4379', '#1d64a6', 0.4, 1.5),
			engineRight2 = new ShipEngine('#0d4379', '#1d64a6', 0.4, 2);

		engineRight1.mesh.position.set(-5, -2 ,-4);
		engineRight2.mesh.position.set(-3, -2 ,-4);

		engineLeft1.mesh.position.set(5, -2, -4);
		engineLeft2.mesh.position.set(3, -2, -4);


		return [engineLeft1, engineLeft2, engineRight2, engineRight1];

	}

	public startEngines() : void
	{
		this.engines.forEach((engine, i) => {

			if(i === 0 || i === 3){
				engine.setLength(8);
			}else{
				engine.setLength(10);
			}

			engine.setSpeed(1);

		});
	}

	public stopEngines() : void
	{
		this.engines.forEach((engine, i) => {

			if(i === 0 || i === 3){
				engine.setLength(1.5);
			}else{
				engine.setLength(2);
			}

			engine.setSpeed(0.4);

		});
	}

	public animateEngines(){
		this.engines.forEach(engine => engine.animate());
	}

}