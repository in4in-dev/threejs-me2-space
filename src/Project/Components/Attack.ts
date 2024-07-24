import Component from "../Core/Component";
import {Vector3} from "three";
import * as THREE from "three";
import Hittable from "./Hittable";

export default abstract class Attack extends Component
{

	public isVisible : boolean = true;

	protected from : Vector3;
	protected force : number;

	constructor(
		from : Vector3,
		force : number,
	) {

		super();

		this.from = from.clone();
		this.force = force;

	}

	public hide(){
		this.isVisible = false;
	}

	public abstract animate(
		peaceObjects : THREE.Object3D[],
		enemiesObjects : Hittable[]
	): void;

}