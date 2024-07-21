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
	public hasRing : boolean;
	public activeColor = 0xff0000;

	public orbit : Orbit | null = null;
	public moons : Moon[] | null = null;
	public label : CSS2DObject | null = null;
	public rings : THREE.Group | null = null;

	constructor(radius : number, orbitRadius : number, name : string, texture : string, moonsCount : number = 0, hasRing : boolean = false) {

		super(radius, texture);

		this.name = name;
		this.moonsCount = moonsCount;
		this.hasRing = hasRing;
		this.orbitRadius = orbitRadius;

	}

	public async load() : Promise<this>
	{

		this.orbit = await this.createOrbit();
		this.label = await this.createLabel();
		this.moons = await this.createMoons(this.moonsCount);
		this.mesh = await this.createBody();

		if(this.hasRing){
			this.rings = await this.createRings();
		}

		this.setRandomPosition(this.orbitRadius);

		return this;
	}

	public addTo(scene : THREE.Scene) : void
	{

		this.mesh!.add(this.label);

		if(this.hasRing){
			this.mesh!.add(this.rings!);
		}

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

	protected generateRing(minRadius : number, maxRadius : number, color : any) : THREE.Mesh
	{

		let radius = THREE.MathUtils.randFloat(minRadius, maxRadius),
			thickness = THREE.MathUtils.randFloat(0.1, 2);

		// Создание колец
		const ringGeometry = new THREE.RingGeometry(radius + thickness, radius, 32);
		const ringMaterial = new THREE.MeshBasicMaterial({
			color: color,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.1,
		});

		let mesh = new THREE.Mesh(ringGeometry, ringMaterial);

		mesh.position.z = THREE.MathUtils.randFloat(-0.1, 0.1);

		return mesh;

	}

	protected async createRings() : Promise<THREE.Group>
	{

		let group = new THREE.Group();

		let maxRadius = this.radius + THREE.MathUtils.randFloat(0.5, 2);

		group.add(
			this.generateRing(this.radius + 0.5, maxRadius, '#f6f6f6'),
			this.generateRing(this.radius + 0.5, maxRadius, '#5e5555'),
			this.generateRing(this.radius + 0.5, maxRadius, '#070707'),
			this.generateRing(this.radius + 0.5, maxRadius, '#44401f'),
			this.generateRing(this.radius + 0.5, maxRadius, '#efea8f')
		);

		return group;

	}

	protected async createMoons(moonsCount : number) : Promise<Moon[]>
	{

		//Moons
		let moonTextures = ["../../assets/planets/1.png", "../../assets/planets/2.png", "../../assets/planets/3.png", "../../assets/planets/4.png", "../../assets/planets/5.png", "../../assets/planets/6.png", "../../assets/planets/7.png", "../../assets/planets/8.png"];

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