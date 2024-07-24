import * as THREE from 'three';
// @ts-ignore
import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";
import Moon from "./Moon";
import Random from "../../Three/Random";
import Component from "../Core/Component";

export default class Planet extends Component
{

	public name : string;
	public hasRing : boolean;
	public texture : string;
	public radius : number;
	public activeColor = 0xff0000;

	public  moons : Moon[] = [];

	protected label : CSS2DObject;
	protected mesh : THREE.Mesh;
	protected rings : THREE.Group | null = null;

	constructor(
		radius : number,
		name : string,
		texture : string,
		moons : Moon[] = [],
		hasRing : boolean = false
	) {
		super();

		this.radius = radius;
		this.texture = texture;
		this.name = name;
		this.hasRing = hasRing;
		this.moons = moons;

		this.mesh = this.createBody();
		this.label = this.createLabel();

		this.moons.forEach(moon => {

			//Случайная позиция
			let angle = Math.random() * 2 * Math.PI;

			moon.position.set(
				(this.radius * 1.2) * Math.cos(angle),
				(this.radius + 1.2) * Math.sin(angle),
				0.5
			);

		});

		this.add(this.mesh, this.label, ...this.moons);

		if(this.hasRing){
			this.rings = this.createRings();
			this.add(this.rings);
		}

	}

	public setActive(active : boolean)
	{

		if(active){
			(<THREE.MeshLambertMaterial>this.mesh.material).color.set(this.activeColor);
			this.label.element.style.opacity = '1';
		}else{
			(<THREE.MeshLambertMaterial>this.mesh.material).color.set(0xffffff);
			this.label.element.style.opacity = '0';
		}

	}

	public getPlanetMesh() : THREE.Mesh
	{
		return this.mesh;
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

	protected createRings() : THREE.Group
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


	protected createBody() : THREE.Mesh
	{

		let planetTexturre = new THREE.TextureLoader().load(this.texture);
		let planetMaterial = new THREE.MeshLambertMaterial({ map: planetTexturre });

		let planet = new THREE.Mesh(
			new THREE.SphereGeometry(this.radius, 200, 200),
			planetMaterial
		);

		return planet;

	}


	protected createLabel() : CSS2DObject
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