import * as THREE from 'three';
import Component from "../Core/Component.ts";

export default class ShipEngine extends Component
{

	public mesh : THREE.Points | null = null;
	public glow : THREE.Sprite | null = null;

	public color : any;
	public glowColor : any;
	public length : number;
	public speed : number;

	protected positions : Float32Array;


	constructor(color : any = 'white', glowColor : any = '#fed36a', speed : number = 1, length : number = 10) {
		super();
		this.color = color;
		this.glowColor = glowColor;
		this.speed = speed;
		this.length = length;
		this.positions = this.generatePositions();
	}

	public async load() : Promise<this>
	{
		this.mesh = await this.createBody();
		this.glow = await this.createGlow();

		return this;
	}

	public addTo(mesh : THREE.Mesh)
	{
		this.mesh!.add(this.glow!);

		mesh.add(this.mesh!);

	}

	public setLength(x : number): this
	{
		this.length = x;
		return this;
	}

	public setSpeed(x : number): this
	{
		this.speed = x;
		return this;
	}

	protected generatePositions() : Float32Array
	{

		let numPoints = 100;

		// Генерируем позиции для точек внутри круга
		const positions = new Float32Array(numPoints * 3);
		for (let i = 0; i < numPoints; i++) {

			let radius = 1;
			//THREE.MathUtils.randInt(0.2, 1);

			const r = radius * Math.sqrt(Math.random());
			const theta = Math.random() * 2 * Math.PI;

			const x = r * Math.cos(theta);
			const y = r * Math.sin(theta);
			const z = 0;

			positions[i * 3] = x;
			positions[i * 3 + 1] = y;
			positions[i * 3 + 2] = z;
		}

		return positions;

	}

	protected async createGlow() : Promise<THREE.Sprite>
	{

		const glowTexture = new THREE.TextureLoader().load('../../assets/glow.png');

		const glowMaterial = new THREE.SpriteMaterial({
			map: glowTexture,
			color: this.glowColor, // Цвет свечения
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite:false
		});

		const glowSprite = new THREE.Sprite(glowMaterial);
		glowSprite.scale.set(20, 10, 10);

		return glowSprite;

	}

	protected async createBody() : Promise<THREE.Points>
	{

		const pointsGeometry = new THREE.BufferGeometry();
		pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));

		let particleTexture = new THREE.TextureLoader().load('../../assets/glow.png');

		let points = new THREE.Points(pointsGeometry, new THREE.PointsMaterial({
			// color: this.color,
			map : particleTexture,
			size: 0.05, // Размер частиц
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		}));

		points.rotation.x = Math.PI / 2;
		points.position.y = -2;
		points.position.z = -4;

		return points;


	}

	public animate(){

		let positions = new Float32Array(this.positions.length);

		for(let i = 0; i<this.positions.length;i+=3){

			let max = THREE.MathUtils.randFloat(0.8, 1);

			positions[i] = this.positions[i];

			if(this.positions[i+1] < -this.length * max){
				positions[i+1] = 0;
			}else{
				positions[i+1] = this.positions[i+1] - THREE.MathUtils.randFloat(0.1 * this.speed, 1 * this.speed);
			}

			positions[i+2] = this.positions[i+2];
		}

		this.positions = positions;

		const pointsGeometry = new THREE.BufferGeometry();
		pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));


		this.mesh!.geometry.copy(pointsGeometry);


	}


}