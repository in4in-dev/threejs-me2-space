import * as THREE from 'three';
import Component from "../Core/Component";

export default class Belt extends Component
{

	public radius : number;
	public thickness : number;

	protected mesh : THREE.Points;

	constructor(radius : number, thickness : number) {

		super();

		this.radius = radius;
		this.thickness = thickness;

		this.mesh = this.createBody();

		this.add(this.mesh);

	}

	protected createBody() : THREE.Points
	{

		let particleTexture = new THREE.TextureLoader().load('../../assets/sand.png');

		let particleCount = this.radius * 2000;

		let particles = new Float32Array(particleCount * 3);

		for (let i = 0; i < particleCount; i++) {
			let angle = Math.random() * Math.PI * 2;
			let tubeAngle = Math.random() * Math.PI * 2;

			let thickness = this.thickness * Math.random();

			let x = (this.radius + thickness * Math.cos(tubeAngle)) * Math.cos(angle);
			let y = (this.radius + thickness * Math.cos(tubeAngle)) * Math.sin(angle);
			let z = thickness * Math.sin(tubeAngle);

			particles[i * 3] = x;
			particles[i * 3 + 1] = y;
			particles[i * 3 + 2] = z;
		}

		// Создание буферной геометрии и добавление частиц
		let particleGeometry = new THREE.BufferGeometry();
		particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

		// Создание материала для частиц
		let material = new THREE.PointsMaterial({
			map: particleTexture,
			size: 0.1, // Размер частиц
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		});

		// Создание точек (астероидов)
		return new THREE.Points(particleGeometry, material);

	}

	// public animateCollision(mesh : THREE.Mesh){
	//
	// 	let positions = this.mesh!.geometry.attributes.position.array;
	//
	// 	for (let i = 0; i < positions.length; i += 3) {
	// 		let dx = mesh.position.x - positions[i];
	// 		let dy = mesh.position.y - positions[i + 1];
	// 		let dz = mesh.position.z - positions[i + 2];
	// 		let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
	//
	// 		if (distance < 2) {
	//
	// 			// Вычисление силы отталкивания
	// 			let forceX = (dx / distance) * -2;
	// 			let forceY = (dy / distance) * -2;
	// 			let forceZ = (dz / distance) * -0.5;
	//
	// 			// Обновление позиции астероида
	// 			positions[i] += forceX;
	// 			positions[i + 1] += forceY;
	// 			positions[i + 2] += forceZ;
	//
	// 			// Установка флага обновления позиций
	// 			let particleGeometry = new THREE.BufferGeometry();
	// 			particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	//
	// 			this.mesh!.geometry.copy(particleGeometry);
	// 		}
	// 	}
	//
	//
	// }


}