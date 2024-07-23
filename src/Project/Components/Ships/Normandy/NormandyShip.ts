import WarShip from "../../WarShip";
import * as THREE from "three";
import ModelLoader from "../../../../Three/ModelLoader";
import NormandyEngine from "./NormandyEngine";
import NormandyEngines from "./NormandyEngines";

export class NormandyShip extends WarShip
{

	public mesh : THREE.Mesh | null = null;
	public light : THREE.Light | null = null;
	public engines : NormandyEngines | null = null;

	public async load() : Promise<this>
	{

		await super.load();

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

		this.group!.add(this.mesh!);

		super.addTo(scene);
	}

	protected async createLight() : Promise<THREE.Light>
	{

		let light = new THREE.PointLight('white', 1, 100);

		light.position.set(5, 5, 5);

		return light;

	}

	protected async createBody() : Promise<THREE.Mesh>
	{

		let ship = await new ModelLoader('../../assets/ship/ship.obj', '../../../../assets/ship/ship.mtl').load();

		ship.scale.set(0.15, 0.15, 0.15);
		ship.rotation.x = 1.5;

		return ship;

	}

	protected async createEngines() : Promise<NormandyEngines>
	{

		let engineLeft1 = await new NormandyEngine('#0d4379', '#1d64a6', 0.4, 1.5).load(),
			engineLeft2 = await new NormandyEngine('#0d4379', '#1d64a6', 0.4, 2).load(),
			engineRight1 = await new NormandyEngine('#0d4379', '#1d64a6', 0.4, 1.5).load(),
			engineRight2 = await new NormandyEngine('#0d4379', '#1d64a6', 0.4, 2).load();

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