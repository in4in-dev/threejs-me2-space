import * as THREE from 'three';
import ModelLoader from "../../Three/ModelLoader";
import Component from "../Core/Component";
import Random from "../../Three/Random";

export default class Asteroid extends Component
{

	protected texture : string;
	protected material : string;

	protected mesh : THREE.Object3D;

	constructor(texture : string, material : string) {

		super();

		this.texture = texture;
		this.material = material;

		this.mesh = this.createBody();

		//Добавляем на сцену
		this.add(this.mesh);

	}

	protected createBody() : THREE.Object3D
	{

		let asteroid = new ModelLoader(this.texture, this.material).loadInBackground();

		let scale = Random.float(0.0001, 0.03);

		asteroid.scale.set(scale, scale, scale);

		asteroid.rotation.x = Math.PI * Random.float(-2, 2);
		asteroid.rotation.y = Math.PI * Random.float(-2, 2);
		asteroid.rotation.z = Math.PI * Random.float(-2, 2);

		return asteroid;

	}

}