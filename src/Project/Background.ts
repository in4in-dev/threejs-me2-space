import * as THREE from 'three';
import MeshBasicTextureMaterial from "../Three/MeshBasicTextureMaterial.ts";

export default class Background
{
	public mesh : THREE.Mesh;
	public points : THREE.Points;

	public picture : string;
	public opacity : number;

	constructor(picture : string, opacity : number = 0.7) {
		this.picture = picture;
		this.opacity = opacity;
		this.mesh = this.createBody();
		this.points = this.createPoints();
	}

	public addToScene(scene : THREE.Scene) : void
	{
		scene.add(this.mesh);
		scene.add(this.points);
	}

	protected createPoints() : THREE.Points
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

	protected createBody() : THREE.Mesh
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