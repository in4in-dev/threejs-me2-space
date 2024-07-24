import WarShip from "../../WarShip";
import * as THREE from "three";
import ModelLoader from "../../../../Three/ModelLoader";
import NormandyEngine from "./NormandyEngine";
import NormandyEngines from "./NormandyEngines";
import BulletsContainer from "../../BulletsContainer";
import Hittable from "../../Hittable";

export class NormandyShip extends WarShip implements Hittable
{

	protected mesh : THREE.Group;
	protected light : THREE.Light;
	protected engines : NormandyEngines;

	constructor(x : number = 10, y : number = 10, speed : number = 0.1, bulletGroup : BulletsContainer) {

		super(x, y, speed, bulletGroup);

		this.light = this.createLight();
		this.engines = this.createEngines();
		this.mesh = this.createBody();

		//Добавляем на сцену
		this.mesh.add(this.engines.l1, this.engines.l2, this.engines.r1, this.engines.r2);

		this.add(this.mesh, this.light);


	}

	protected createLight() : THREE.Light
	{

		let light = new THREE.PointLight('white', 1, 10);

		light.position.set(0, 0, 1);

		return light;

	}

	protected createBody() : THREE.Group
	{

		let ship = new ModelLoader('../../assets/ship/ship.obj', '../../../../assets/ship/ship.mtl').loadInBackground();

		ship.scale.set(0.15, 0.15, 0.15);
		ship.rotation.x = 1.5;

		return ship;

	}

	protected createEngines() : NormandyEngines
	{

		let engineLeft1 = new NormandyEngine('#0d4379', '#1d64a6', 0.4, 1.5),
			engineLeft2 = new NormandyEngine('#0d4379', '#1d64a6', 0.4, 2),
			engineRight1 = new NormandyEngine('#0d4379', '#1d64a6', 0.4, 1.5),
			engineRight2 = new NormandyEngine('#0d4379', '#1d64a6', 0.4, 2);

		engineRight1.position.set(-5, 0 ,0);
		engineRight2.position.set(-3, 0 ,0);

		engineLeft1.position.set(5, 0, 0);
		engineLeft2.position.set(3, 0, 0);

		return {
			l1 : engineLeft1,
			l2 : engineLeft2,
			r2 : engineRight2,
			r1 : engineRight1
		}

	}

	public startEngines() : void
	{

		this.engines.l1.setLength(8).setSpeed(1);
		this.engines.r1.setLength(8).setSpeed(1);

		this.engines.l2.setLength(10).setSpeed(1);
		this.engines.r2.setLength(10).setSpeed(1);

	}

	public stopEngines() : void
	{

		this.engines.l1.setLength(1.5).setSpeed(0.4);
		this.engines.r1.setLength(1.5).setSpeed(0.4);

		this.engines.l2.setLength(2).setSpeed(0.4);
		this.engines.r2.setLength(2).setSpeed(0.4);

	}

	public animate(){

		this.engines.r1.animate();
		this.engines.r2.animate();
		this.engines.l1.animate();
		this.engines.l2.animate();

	}

	public hit(){

	}


}