import * as THREE from 'three';
import MeshBasicTextureMaterial from "../../Three/MeshBasicTextureMaterial";
import Component from "../Core/Component";
import Random from "../../Three/Random";

export default class Background extends Component
{

	protected mesh : THREE.Mesh | null = null;
	protected points : THREE.Points  | null = null;
	protected sprites : THREE.Sprite[] | null = null;

	public picture : string;
	public opacity : number;

	constructor(picture : string, opacity : number = 0.7) {
		super();
		this.picture = picture;
		this.opacity = opacity;
	}

	public async load() : Promise<this>
	{

		this.mesh = await this.createBody();
		this.points = await this.createPoints();
		this.sprites = await this.createSprites();

		this.add(this.mesh);
		this.add(this.points);
		this.add(...this.sprites);

		return this;

	}

	protected createSmoke(path : string, color : any | null = null, opacity : number = 1) : THREE.Sprite
	{

		let smokeTexture = new THREE.TextureLoader().load(path);

		let smokeMaterial = new THREE.SpriteMaterial({
			map: smokeTexture,
			transparent: true,
			blending : THREE.AdditiveBlending,
			depthWrite:false,
			opacity,
			color
		});

		let smokeSprite = new THREE.Sprite(smokeMaterial);

		smokeSprite.position.set(Random.int(-30, 30), Random.int(-30, 30), -1);
		smokeSprite.scale.set(Random.int(20, 100), Random.int(10, 40), 20);

		return smokeSprite;

	}

	protected async createSprites() : Promise<THREE.Sprite[]>
	{

		return [
			this.createSmoke('../../assets/smokes/1.png', '#d98911', 0.8),
			this.createSmoke('../../assets/smokes/1.png', '#887272', 0.8),
			this.createSmoke('../../assets/smokes/3.png', 'white', 0.2)
		]

	}

	protected async createPoints() : Promise<THREE.Points>
	{

		let positions = [];

		for (let i = 0; i < 20000; i++) {

			let phi = Math.acos(2 * Math.random() - 1);
			let theta = 2 * Math.PI * Math.random();

			let x = Random.int(0, 100) * Math.sin(phi) * Math.cos(theta);
			let y = Random.int(0, 100) * Math.sin(phi) * Math.sin(theta);
			let z = Random.int(0, 100) * Math.abs(Math.cos(phi));

			positions.push(x, y, z);

		}

		let particleTexture = new THREE.TextureLoader().load('../../assets/sand.png');

		let particleGeometry = new THREE.BufferGeometry();
		particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

		let material = new THREE.PointsMaterial({
			map: particleTexture,
			size: 0.1,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		});


		return new THREE.Points(particleGeometry, material);

	}

	protected async createBody() : Promise<THREE.Mesh>
	{

		let spaceTexture = new THREE.TextureLoader().load(this.picture);

		let spaceMaterial = new MeshBasicTextureMaterial(spaceTexture, this.opacity, {side: THREE.BackSide});

		let spaceGeometry = new THREE.SphereGeometry(500, 14, 14); // Большая сфера, окружающая сцену
		let spaceBackground = new THREE.Mesh(spaceGeometry, spaceMaterial);

		spaceBackground.rotation.x = 3000;
		spaceBackground.rotation.z = 300;
		spaceBackground.rotation.y = 300;

		return spaceBackground;

	}

}