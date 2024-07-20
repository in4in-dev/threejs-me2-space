import * as THREE from 'three';
import Sparks from "./Sparks.ts";

export default class Sun
{

	public mesh : THREE.Mesh;
	public glow : THREE.Sprite;
	public light : THREE.Light;

	public sparks : Sparks;

	public color : any;
	public glowColor : any;
	public intensity : number;
	public radius : number;

	constructor(radius : number = 2, intensity : number = 500, color : any = 'white', glowColor : any = '#fed36a') {

		this.intensity = intensity;
		this.color = color;
		this.glowColor = glowColor;
		this.radius = radius;

		this.mesh = this.createBody();
		this.light = this.createLight();
		this.glow = this.createGlow();
		this.sparks = new Sparks(this.radius, this.color);
	}

	public addToScene(scene : THREE.Scene) : void
	{
		this.mesh.add(this.glow);
		this.sparks.addToMesh(this.mesh!);

		scene.add(this.mesh);
		scene.add(this.light);
	}


	protected createGlow() : THREE.Sprite
	{

		// Загрузка текстуры для свечения
		const glowTexture = new THREE.TextureLoader().load('../../glow.png');

		// Создание материала для свечения
		const glowMaterial = new THREE.SpriteMaterial({
			map: glowTexture,
			color: this.glowColor, // Цвет свечения
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite:false
		});

		// Создание спрайта для свечения
		const glowSprite = new THREE.Sprite(glowMaterial);
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

		let sunLight = new THREE.PointLight('white', this.intensity, 10000); // Цвет, интенсивность и дистанция освещения
		sunLight.position.set(0, 0, 0); // Положение в центре сцены (где солнце должно быть)

		return sunLight;

	}

	public animateSparks(){
		this.sparks.animate();
	}

}