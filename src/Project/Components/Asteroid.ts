import * as THREE from 'three';
import ModelLoader from "../../Three/ModelLoader";
import Component from "../Core/Component";
import Random from "../../Three/Random";

export default class Asteroid extends Component
{

	protected texture : string;
	protected material : string;

	protected mesh : THREE.Object3D | null = null;

	constructor(texture : string, material : string) {

		super();

		this.texture = texture;
		this.material = material;

	}

	public async load() : Promise<this>
	{
		this.mesh = await this.createBody();

		this.add(this.mesh);

		return this;
	}

	protected async createBody() : Promise<THREE.Object3D>
	{

		let asteroid = await new ModelLoader(this.texture, this.material).load();

		let scale = Random.float(0.0001, 0.03);

		asteroid.scale.set(scale, scale, scale);

		asteroid.rotation.x = Math.PI * Random.float(-2, 2);
		asteroid.rotation.y = Math.PI * Random.float(-2, 2);
		asteroid.rotation.z = Math.PI * Random.float(-2, 2);

		return asteroid;

	}

}