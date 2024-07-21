import * as THREE from 'three';
import Component from "../Core/Component.ts";

export default class Sparks extends Component
{

	public points : THREE.Points | null = null;

	public color : any;
	public minRadius : number;
	public maxRadius : number;

	protected positions : number[];

	constructor(radius : number, color : any) {

		super();

		this.minRadius = radius;
		this.maxRadius = radius + 0.5;
		this.color = color;

		this.positions = this.generateRandomPositions();
	}

	public async load() : Promise<this>
	{
		this.points = await this.createPoints();

		return this;
	}

	public addTo(mesh : THREE.Mesh)
	{
		mesh.add(this.points!);
	}

	protected generateRandomPositions() : number[]
	{

		let positions = [];

		for (let i = 0; i < this.maxRadius * 2000; i++) {

			let phi = Math.acos(2 * Math.random() - 1);
			let theta = 2 * Math.PI * Math.random();

			let x = THREE.MathUtils.randFloat(this.minRadius, this.maxRadius) * Math.sin(phi) * Math.cos(theta);
			let y = THREE.MathUtils.randFloat(this.minRadius, this.maxRadius) * Math.sin(phi) * Math.sin(theta);
			let z = THREE.MathUtils.randFloat(this.minRadius, this.maxRadius) * Math.cos(phi);

			positions.push(x, y, z);

		}

		return positions;

	}

	protected async createPoints() : Promise<THREE.Points>
	{

		let particleTexture = new THREE.TextureLoader().load('../../sand.png');

		const particleGeometry = new THREE.BufferGeometry();
		particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));

		const material = new THREE.PointsMaterial({
			map: particleTexture,
			size: 0.5,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		});


		return new THREE.Points(particleGeometry, material);

	}

	public animate(){

		for(let i = 0; i< this.positions.length;i+=3){

			let x = this.positions[i],
				y = this.positions[i + 1],
				z = this.positions[i + 2];

			x += (THREE.MathUtils.randInt(0, 2) - 1) * THREE.MathUtils.randFloat(0.005, 0.02);
			y += (THREE.MathUtils.randInt(0, 2) - 1) * THREE.MathUtils.randFloat(0.005, 0.02);
			z += (THREE.MathUtils.randInt(0, 2) - 1) * THREE.MathUtils.randFloat(0.005, 0.02);

			let distance = Math.sqrt(x * x + y * y + z * z),
				maximum = this.maxRadius * 1.3,
				scale = maximum / distance;

			if (distance > maximum) {
				x *= scale;
				y *= scale;
				z *= scale;
			}

			this.positions[i] = x;
			this.positions[i + 1] = y;
			this.positions[i + 2] = z;

		}

		const particleGeometry = new THREE.BufferGeometry();
		particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));

		this.points!.geometry.copy(particleGeometry);

	}



}