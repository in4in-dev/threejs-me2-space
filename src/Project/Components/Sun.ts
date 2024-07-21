import * as THREE from 'three';
import Sparks from "./Sparks.ts";
import Component from "../Core/Component.ts";

export default class Sun extends Component
{

	public mesh : THREE.Mesh | null = null;
	public glow : THREE.Sprite | null = null;
	public light : THREE.Light | null = null;
	public sparks : Sparks | null = null;

	public color : any;
	public glowColor : any;
	public intensity : number;
	public radius : number;

	constructor(radius : number = 2, intensity : number = 500, color : any = 'white', glowColor : any = '#fed36a') {

		super();

		this.intensity = intensity;
		this.color = color;
		this.glowColor = glowColor;
		this.radius = radius;

	}

	public async load(): Promise<this>
	{
		this.mesh = await this.createBody();
		this.light = await this.createLight();
		this.glow = await this.createGlow();
		this.sparks = await this.createSparks();

		return this;
	}

	public addTo(scene : THREE.Scene) : void
	{
		this.mesh!.add(this.glow!);
		this.sparks!.addTo(this.mesh!);

		scene.add(this.mesh!);
		scene.add(this.light!);
	}


	protected async createGlow() : Promise<THREE.Sprite>
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

	protected async createBody() : Promise<THREE.Mesh>
	{

		// Создание материала для солнца
		let sunMaterial = new THREE.MeshBasicMaterial({color: 'white'});

		let sunGeometry = new THREE.IcosahedronGeometry(this.radius, 64);

		return new THREE.Mesh(sunGeometry, sunMaterial);

	}

	protected async createLight() : Promise<THREE.Light>
	{

		let sunLight = new THREE.PointLight('white', this.intensity, 10000); // Цвет, интенсивность и дистанция освещения
		sunLight.position.set(0, 0, 0); // Положение в центре сцены (где солнце должно быть)

		return sunLight;

	}

	protected async createSparks() : Promise<Sparks>
	{
		return await new Sparks(this.radius, this.color).load();
	}

	public animateSparks(){
		this.sparks!.animate();
	}

}