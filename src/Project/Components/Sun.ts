import * as THREE from 'three';
import Sparks from "./Sparks";
import Component from "../Core/Component";

export default class Sun extends Component
{

	protected mesh : THREE.Mesh | null = null;
	protected glow : THREE.Sprite | null = null;
	protected light : THREE.Light | null = null;
	protected sparks : Sparks | null = null;

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

		this.add(this.mesh, this.light, this.sparks, this.glow);

		return this;
	}

	public getSunMesh() : THREE.Mesh | null
	{
		return this.mesh;
	}


	protected async createGlow() : Promise<THREE.Sprite>
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

	protected async createBody() : Promise<THREE.Mesh>
	{

		// Создание материала для солнца
		let sunMaterial = new THREE.MeshBasicMaterial({color: 'white'});

		let sunGeometry = new THREE.IcosahedronGeometry(this.radius, 64);

		return new THREE.Mesh(sunGeometry, sunMaterial);

	}

	protected async createLight() : Promise<THREE.Light>
	{

		let sunLight = new THREE.PointLight('white', 2, 10000, 0.02); // Цвет, интенсивность и дистанция освещения
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