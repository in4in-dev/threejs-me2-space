import * as THREE from 'three';
import MeshBasicTextureMaterial from "../../Three/MeshBasicTextureMaterial.ts";
import Component from "../Core/Component.ts";

export default class Background extends Component
{
	public mesh : THREE.Mesh | null = null;
	public points : THREE.Points  | null = null;
	public sprites : THREE.Sprite[] | null = null;

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

		return this;

	}

	public addTo(scene : THREE.Scene) : void
	{
		scene.add(this.mesh!);
		scene.add(this.points!);

		this.sprites!.forEach(sprite => scene.add(sprite));
	}

	protected generateSmoke(path : string, color : any | null = null, opacity : number = 1) : THREE.Sprite
	{

		const smokeTexture = new THREE.TextureLoader().load(path);

		let options : any = {
			map: smokeTexture,
			transparent: true,
		};

		if(color){
			options = {
				blending : THREE.AdditiveBlending,
				depthWrite:false,
				opacity,
				color,
				...options
			}
		}

		const smokeMaterial = new THREE.SpriteMaterial(options);

		const smokeSprite = new THREE.Sprite(smokeMaterial);

		smokeSprite.position.set(
			THREE.MathUtils.randInt(-30, 30),
			THREE.MathUtils.randInt(-30, 30),
			-1
		);

		smokeSprite.scale.set(
			THREE.MathUtils.randInt(20, 100),
			THREE.MathUtils.randInt(10, 40),
			20
		);

		return smokeSprite;

	}

	protected async createSprites() : Promise<THREE.Sprite[]>
	{

		return [
			this.generateSmoke('../../smokes/1.png', '#d98911', 0.8),
			this.generateSmoke('../../smokes/1.png', '#887272', 0.8),
			this.generateSmoke('../../smokes/3.png'),
			// this.generateSmoke('../../smokes/2.png'),
		]

	}

	protected async createPoints() : Promise<THREE.Points>
	{

		let positions = [];

		for (let i = 0; i < 20000; i++) {

			let phi = Math.acos(2 * Math.random() - 1);
			let theta = 2 * Math.PI * Math.random();

			let x = THREE.MathUtils.randInt(0, 100) * Math.sin(phi) * Math.cos(theta);
			let y = THREE.MathUtils.randInt(0, 100) * Math.sin(phi) * Math.sin(theta);
			let z = THREE.MathUtils.randInt(0, 100) * Math.cos(phi);

			positions.push(x, y, z);

		}

		let particleTexture = new THREE.TextureLoader().load('../../sand.png');

		const particleGeometry = new THREE.BufferGeometry();
		particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

		const material = new THREE.PointsMaterial({
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