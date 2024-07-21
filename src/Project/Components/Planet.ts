import * as THREE from 'three';
// @ts-ignore
import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";
import Orbit from "./Orbit.ts";
import Sphere from "./Sphere.ts";
import Moon from "./Moon.ts";

export default class Planet extends Sphere
{

	public name : string;
	public orbitRadius : number;
	public moonsCount : number;
	public activeColor = 0xff0000;

	public orbit : Orbit | null = null;
	public moons : Moon[] | null = null;
	public label : CSS2DObject | null = null;

	constructor(radius : number, orbitRadius : number, name : string, texture : string, moonsCount : number = 0) {

		super(radius, texture);

		this.name = name;
		this.moonsCount = moonsCount;
		this.orbitRadius = orbitRadius;

	}

	public async load() : Promise<this>
	{

		this.orbit = await this.createOrbit();
		this.label = await this.createLabel();
		this.moons = await this.createMoons(this.moonsCount);
		this.mesh = await this.createBody();

		this.setRandomPosition(this.orbitRadius);

		return this;
	}

	public addTo(scene : THREE.Scene) : void
	{

		this.mesh!.add(this.label);

		this.moons!.forEach(moon => moon.addTo(this.mesh!));

		scene.add(this.mesh!);

		this.orbit!.addTo(scene);

	}

	public setActive(active : boolean)
	{

		if(active){
			(<THREE.MeshLambertMaterial>this.mesh!.material).color.set(this.activeColor);
			this.label.element.style.opacity = '1';
		}else{
			(<THREE.MeshLambertMaterial>this.mesh!.material).color.set(0xffffff);
			this.label.element.style.opacity = '0';
		}

	}


	protected setRandomPosition(orbitRadius : number)
	{

		let angle = Math.random() * 2 * Math.PI;

		this.mesh!.position.set(
			orbitRadius * Math.cos(angle),
			orbitRadius * Math.sin(angle),
			0
		);

	}

	protected async createOrbit() : Promise<Orbit>
	{
		return await new Orbit(this.orbitRadius).load();
	}

	protected async createMoons(moonsCount : number) : Promise<Moon[]>
	{

		//Moons
		let moonTextures = ["planets/1.png", "planets/2.png", "planets/3.png", "planets/4.png", "planets/5.png", "planets/6.png", "planets/7.png", "planets/8.png"];

		let moons = [];
		for(let i = 0; i < moonsCount; i++){

			let moonRadius = THREE.MathUtils.randFloat(this.radius * 0.1, this.radius * 0.2);

			let moon = new Moon(
				this.radius,
				moonRadius,
				moonTextures[THREE.MathUtils.randInt(0, moonTextures.length - 1)],
			);

			await moon.load();

			moons.push(moon);

		}


		return moons;

	}

	protected async createLabel() : Promise<CSS2DObject>
	{

		// Создание метки для планеты
		let div = document.createElement('div');
		div.className = 'label';
		div.textContent = this.name;
		div.style.marginLeft = this.name.length * 5 + 'px';
		div.style.opacity = '0';

		let label = new CSS2DObject(div);
		label.position.set(0, this.radius + 2, 0);

		return label;

	}

}