import * as THREE from 'three';
//@ts-ignore
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
//@ts-ignore
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import ModelLoader from "../../Three/ModelLoader.ts";
import Component from "../Core/Component.ts";

export default class Asteroid extends Component
{

	protected texture : string;
	protected material : string;

	public mesh : THREE.Group | null = null;

	constructor(texture : string, material : string) {

		super();

		this.texture = texture;
		this.material = material;

	}

	public async load() : Promise<this>
	{
		this.mesh = await this.createBody();

		return this;
	}

	public addTo(group : THREE.Group) : void
	{
		group.add(this.mesh!);
	}

	protected async createBody() : Promise<THREE.Group>
	{

		let asteroid = await new ModelLoader(this.texture, this.material).load();

		let scale = THREE.MathUtils.randFloat(0.0001, 0.03);

		asteroid.scale.set(scale, scale, scale);

		asteroid.rotation.x = Math.PI * THREE.MathUtils.randFloat(-2, 2);
		asteroid.rotation.y = Math.PI * THREE.MathUtils.randFloat(-2, 2);
		asteroid.rotation.z = Math.PI * THREE.MathUtils.randFloat(-2, 2);

		return asteroid;

	}

}