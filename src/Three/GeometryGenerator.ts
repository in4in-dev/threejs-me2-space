import * as THREE from "three";

export default class GeometryGenerator
{

	public static emptySphere(radius : number, pointsCount : number) : THREE.BufferGeometry
	{

		let points = [];

		for (let i = 0; i < pointsCount; i++) {
			let phi = Math.acos(2 * Math.random() - 1);
			let theta = 2 * Math.PI * Math.random();
			let x = radius * Math.sin(phi) * Math.cos(theta);
			let y = radius * Math.sin(phi) * Math.sin(theta);
			let z = radius * Math.cos(phi);

			points.push(new THREE.Vector3(x, y, z));
		}

		return new THREE.BufferGeometry().setFromPoints(points);

	}

}