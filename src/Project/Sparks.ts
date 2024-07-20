import * as THREE from 'three';

export default class Sparks
{

	public points : THREE.Points;
	public positions : number[];

	public color : any;
	public minRadius : number;
	public maxRadius : number;

	constructor(radius : number, color : any) {
		this.minRadius = radius;
		this.maxRadius = radius + 0.5;
		this.color = color;

		this.positions = this.generateRandomPositions();
		this.points = this.createPoints();
	}

	protected generateRandomPositions() : number[]
	{

		let positions = [];

		for (let i = 0; i < this.maxRadius * 5000; i++) {

			let phi = Math.acos(2 * Math.random() - 1);
			let theta = 2 * Math.PI * Math.random();

			let x = THREE.MathUtils.randFloat(this.minRadius, this.maxRadius) * Math.sin(phi) * Math.cos(theta);
			let y = THREE.MathUtils.randFloat(this.minRadius, this.maxRadius) * Math.sin(phi) * Math.sin(theta);
			let z = THREE.MathUtils.randFloat(this.minRadius, this.maxRadius) * Math.cos(phi);

			positions.push(x, y, z);

		}

		return positions;

	}

	protected createPoints() : THREE.Points
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

	public addToMesh(mesh : THREE.Mesh)
	{
		mesh.add(this.points);
	}

	public animate(){

		this.positions = this.positions.map(cord => {
			return cord + (THREE.MathUtils.randInt(0, 2) - 1) * THREE.MathUtils.randFloat(0.005, 0.02);
		});

		const particleGeometry = new THREE.BufferGeometry();
		particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));

		this.points.geometry.copy(particleGeometry);

	}



}