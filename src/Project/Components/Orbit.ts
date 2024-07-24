import * as THREE from 'three';
import {Curve, Vector3} from "three";
import Component from "../Core/Component";

export default class Orbit extends Component
{

	public radius : number;
	public color : any;
	public activeColor : any;
	public thickness : number;

	protected mesh : THREE.Mesh;

	constructor(radius : number, color : any = 0x2c63ab, thickness : number = 0.05, activeColor : any = 0xff0000) {

		super();

		this.radius = radius;
		this.color = color;
		this.activeColor = activeColor;
		this.thickness = thickness;

		this.mesh = this.createBody();

		this.add(this.mesh);

	}

	public setActive(active : boolean) : void
	{

		if (active) {
			(<THREE.MeshBasicMaterial>this.mesh!.material).color.set(this.activeColor);
		} else {
			(<THREE.MeshBasicMaterial>this.mesh!.material).color.set(this.color);
		}

	}

	protected createBody() : THREE.Mesh
	{

		// Создание кривой эллипса для орбиты
		let curve = new THREE.EllipseCurve(
			0, 0,            // ax, aY
			this.radius, this.radius,  // xRadius, yRadius
			0, 2 * Math.PI,  // aStartAngle, aEndAngle
			false,           // aClockwise
			0                // aRotation
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