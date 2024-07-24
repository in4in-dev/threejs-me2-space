import * as THREE from 'three';
import Sparks from "./Sparks";
import Component from "../Core/Component";

export default class Sun extends Component
{

	public color : any;
	public glowColor : any;
	public intensity : number;
	public radius : number;

	protected mesh : THREE.Mesh;
	protected glow : THREE.Sprite;
	protected light : THREE.Light;
	protected sparks : Sparks;

	constructor(radius : number = 2, intensity : number = 500, color : any = 'white', glowColor : any = '#fed36a') {

		super();

		this.intensity = intensity;
		this.color = color;
		this.glowColor = glowColor;
		this.radius = radius;

		this.mesh = this.createBody();
		this.light = this.createLight();
		this.glow = this.createGlow();
		this.sparks = this.createSparks();

		//Добавляем на сцену
		this.add(this.mesh, this.light, this.sparks, this.glow);

	}

	public getSunMesh() : THREE.Mesh
	{
		return this.mesh;
	}


	protected createGlow() : THREE.Sprite
	{

		// Загрузка текстуры для свечения
		let glowTexture = new THREE.TextureLoader().load('../../assets/glow.png');

		// Создание материала для свечения
		let glowMaterial = new THREE.SpriteMaterial({
			map: glowTexture,
			color: this.glowColor, // Цвет свечения
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite:false
		});

		// Создание спрайта для свечения
		let glowSprite = new THREE.Sprite(glowMaterial);
		glowSprite.scale.set(20, 10, 10);

		return glowSprite;

	}

	protected createBody() : THREE.Mesh
	{

		// Создание материала для солнца
		let sunMaterial = new THREE.MeshBasicMaterial({color: 'white'});

		let sunGeometry = new THREE.IcosahedronGeometry(this.radius, 64);

		return new THREE.Mesh(sunGeometry, sunMaterial);

	}

	protected createLight() : THREE.Light
	{

		let sunLight = new THREE.PointLight('white', 2, 10000, 0.02); // Цвет, интенсивность и дистанция освещения
		sunLight.position.set(0, 0, 0); // Положение в центре сцены (где солнце должно быть)

		return sunLight;

	}

	protected createSparks() : Sparks
	{
		return new Sparks(this.radius, this.color);
	}

	public animateSparks(){
		this.sparks.animate();
	}

}