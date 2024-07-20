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
	public activeColor = 0xff0000;

	public orbit : Orbit;
	public moons : Moon[];
	public label : CSS2DObject;

	constructor(radius : number, orbitRadius : number, name : string, texture : string, moonsCount : number = 0) {

		super(radius, texture);

		this.name = name;
		this.orbitRadius = orbitRadius;

		this.orbit = new Orbit(orbitRadius);
		this.label = this.createLabel();
		this.moons = this.createMoons(moonsCount);

		this.setRandomPosition(orbitRadius);

	}

	protected setRandomPosition(orbitRadius : number)
	{

		let angle = Math.random() * 2 * Math.PI;

		this.mesh.position.set(
			orbitRadius * Math.cos(angle),
			orbitRadius * Math.sin(angle),
			0
		);

	}

	public setActive(active : boolean)
	{

		if(active){
			(<THREE.MeshLambertMaterial>this.mesh.material).color.set(this.activeColor); // Изменение цвета планеты на красный при близости
			this.label.element.style.opacity = '1'; // Показываем метку
		}else{
			(<THREE.MeshLambertMaterial>this.mesh.material).color.set(0xffffff); // Возвращение цвета планеты на исходный, если корабль удаляется
			this.label.element.style.opacity = '0'; // Скрываем метку
		}

	}

	public addToScene(scene : THREE.Scene) : void
	{

		this.mesh.add(this.label);

		this.moons.forEach(moon => moon.addToMesh(this.mesh));

		scene.add(this.mesh);

		this.orbit.addToScene(scene);

	}

	protected createMoons(moonsCount : number) : Moon[]
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

			moons.push(moon);

		}


		return moons;

	}

	protected createBody() : THREE.Mesh
	{

		let planetTexturre = new THREE.TextureLoader().load(this.texture);
		let planetMaterial = new THREE.MeshLambertMaterial({ map: planetTexturre });

		let planet = new THREE.Mesh(
			new THREE.SphereGeometry(this.radius, 200, 200),
			planetMaterial
		);

		let angle = Math.random() * 2 * Math.PI;

		planet.position.set(
			this.orbitRadius * Math.cos(angle),
			this.orbitRadius * Math.sin(angle),
			0
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