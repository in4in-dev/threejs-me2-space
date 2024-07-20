import * as THREE from 'three';
// @ts-ignore
import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";
import Orbit from "./Orbit.ts";

export default class Planet
{

	public texture : string;
	public name : string;
	public radius : number;
	public orbitRadius : number;
	public activeColor = 0xff0000;

	public orbit : Orbit;
	public mesh : THREE.Mesh;
	public label : CSS2DObject;

	constructor(radius : number, orbitRadius : number, name : string, texture : string) {

		this.radius = radius;
		this.name = name;
		this.texture = texture;
		this.orbitRadius = orbitRadius;

		this.orbit = new Orbit(orbitRadius);
		this.mesh = this.createBody();
		this.label = this.createLabel();
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

		scene.add(this.mesh);

		this.orbit.addToScene(scene);

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