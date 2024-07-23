import * as THREE from 'three';
// @ts-ignore
import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";
import Orbit from "./Orbit";
import Sphere from "./Sphere";
import Moon from "./Moon";
import Random from "../../Three/Random";

export default class Planet extends Sphere
{

	public name : string;
	public orbitRadius : number;
	public orbitAngle : number;
	public moonsCount : number;
	public hasRing : boolean;
	public activeColor = 0xff0000;

	public orbit : Orbit | null = null;
	public moons : Moon[] | null = null;

	protected label : CSS2DObject | null = null;
	protected mesh : THREE.Mesh | null = null;
	protected rings : THREE.Group | null = null;
	protected group : THREE.Group | null = null;

	constructor(
		radius : number,
		orbitRadius : number,
		orbitAngle : number,
		name : string,
		texture : string,
		moonsCount : number = 0,
		hasRing : boolean = false
	) {

		super(radius, texture);

		this.name = name;
		this.moonsCount = moonsCount;
		this.orbitAngle = orbitAngle;
		this.hasRing = hasRing;
		this.orbitRadius = orbitRadius;

	}

	public async load() : Promise<this>
	{

		this.group = await this.createGroup();
		this.add(this.group);

		this.orbit = await this.createOrbit();
		this.add(this.orbit);

		this.mesh = await this.createBody();
		this.group.add(this.mesh);

		this.label = await this.createLabel();
		this.group.add(this.label);

		this.moons = await this.createMoons(this.moonsCount);

		if(this.moons.length){
			this.group.add(...this.moons);
		}

		if(this.hasRing){
			this.rings = await this.createRings();
			this.group.add(this.rings);
		}

		return this;
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

	public getPlanetMesh() : THREE.Mesh | null
	{
		return this.mesh;
	}

	public getPlanetGroup() : THREE.Group | null
	{
		return this.group;
	}

	protected async createGroup() : Promise<THREE.Group>
	{

		let group = new THREE.Group();

		group.position.set(
			this.orbitRadius * Math.cos(this.orbitAngle),
			this.orbitRadius * Math.sin(this.orbitAngle),
			0
		);

		return group;

	}

	protected async createOrbit() : Promise<Orbit>
	{
		return await new Orbit(this.orbitRadius).load();
	}

	protected createRing(minRadius : number, maxRadius : number, color : any) : THREE.Mesh
	{

		let radius = Random.float(minRadius, maxRadius),
			thickness = Random.float(0.1, 2);

		// Создание колец
		let ringGeometry = new THREE.RingGeometry(radius + thickness, radius, 32);
		let ringMaterial = new THREE.MeshBasicMaterial({
			color: color,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.1,
		});

		let mesh = new THREE.Mesh(ringGeometry, ringMaterial);

		mesh.position.z = Random.float(-0.1, 0.1);

		return mesh;

	}

	protected async createRings() : Promise<THREE.Group>
	{

		let group = new THREE.Group();

		let maxRadius = this.radius + Random.float(0.5, 2);

		group.add(
			this.createRing(this.radius + 0.5, maxRadius, '#f6f6f6'),
			this.createRing(this.radius + 0.5, maxRadius, '#5e5555'),
			this.createRing(this.radius + 0.5, maxRadius, '#070707'),
			this.createRing(this.radius + 0.5, maxRadius, '#44401f'),
			this.createRing(this.radius + 0.5, maxRadius, '#efea8f')
		);

		return group;

	}

	protected async createMoons(moonsCount : number) : Promise<Moon[]>
	{

		//Moons
		let moonTextures = [
			"../../assets/planets/1.png",
			"../../assets/planets/2.png",
			"../../assets/planets/3.png",
			"../../assets/planets/4.png",
			"../../assets/planets/5.png",
			"../../assets/planets/6.png",
			"../../assets/planets/7.png",
			"../../assets/planets/8.png"
		];

		let moons = [];
		for(let i = 0; i < moonsCount; i++){

			let moonRadius = Random.float(this.radius * 0.1, this.radius * 0.2);

			let moon = new Moon(
				this.radius,
				moonRadius,
				Random.arr(moonTextures),
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