import * as THREE from 'three';
import Component from "../Core/Component";
import Random from "../../Three/Random";

export default class Sparks extends Component
{

	public color : any;
	public minRadius : number;
	public maxRadius : number;

	protected points : THREE.Points | null = null;
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

		this.add(this.points);

		return this;
	}

	protected generateRandomPositions() : number[]
	{

		let positions = [];

		for (let i = 0; i < this.maxRadius * 2000; i++) {

			let phi = Math.acos(2 * Math.random() - 1);
			let theta = 2 * Math.PI * Math.random();

			let x = Random.float(this.minRadius, this.maxRadius) * Math.sin(phi) * Math.cos(theta);
			let y = Random.float(this.minRadius, this.maxRadius) * Math.sin(phi) * Math.sin(theta);
			let z = Random.float(this.minRadius, this.maxRadius) * Math.cos(phi);

			positions.push(x, y, z);

		}

		return positions;

	}

	protected async createPoints() : Promise<THREE.Points>
	{

		let particleTexture = new THREE.TextureLoader().load('../../assets/sand.png');

		let particleGeometry = new THREE.BufferGeometry();
		particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));

		let material = new THREE.PointsMaterial({
			map: particleTexture,
			size: 0.5,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		});


		return new THREE.Points(particleGeometry, material);

	}

	public async animate(){

		for(let i = 0; i< this.positions.length;i+=3){

			let x = this.positions[i],
				y = this.positions[i + 1],
				z = this.positions[i + 2];

			x += (Random.int(0, 2) - 1) * Random.float(0.005, 0.02);
			y += (Random.int(0, 2) - 1) * Random.float(0.005, 0.02);
			z += (Random.int(0, 2) - 1) * Random.float(0.005, 0.02);

			let distance = Math.sqrt(x * x + y * y + z * z),
				maximum = this.maxRadius * 1.1,
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

		let particleGeometry = new THREE.BufferGeometry();
		particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));

		this.points!.geometry.copy(particleGeometry);

	}



}