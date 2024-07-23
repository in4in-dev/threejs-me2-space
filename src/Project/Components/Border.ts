import * as THREE from 'three';
import {Curve, Vector3} from "three";
import Component from "../Core/Component";

export default class Border extends Component
{

	public radius : number;
	public color : any;
	public thickness : number;

	protected mesh : THREE.Mesh | null = null;

	constructor(radius : number, color : any = 0x2c63ab, thickness : number = 0.05) {

		super();

		this.radius = radius;
		this.color = color;
		this.thickness = thickness;

	}

	public async load() : Promise<this>
	{
		this.mesh = await this.createBody();

		this.add(this.mesh);

		return this;
	}


	protected async createBody() : Promise<THREE.Mesh>
	{

		// Создание кривой эллипса для орбиты
		let curve = new THREE.EllipseCurve(
			0, 0,
			this.radius, this.radius,
			0, 2 * Math.PI,
			false,
			0
		);

		// Получение точек из кривой
		let points = curve.getPoints(64);

		// Создание кривой из точек
		let curvePath = new THREE.CurvePath();
		curvePath.add(new THREE.CatmullRomCurve3(
			points.map(point => new THREE.Vector3(point.x, 0, point.y)))
		);

		// Создание трубчатой геометрии
		let tubeGeometry = new THREE.TubeGeometry(<Curve<Vector3>>curvePath, 200, this.thickness, 8, true);

		let material = new THREE.MeshBasicMaterial({ color: this.color });
		let mesh = new THREE.Mesh(tubeGeometry, material);

		mesh.rotation.x = Math.PI / 2; // Поворот орбиты, чтобы она лежала в плоскости XZ

		return mesh;

	}

}