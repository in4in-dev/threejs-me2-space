import * as THREE from 'three';
//@ts-ignore
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
//@ts-ignore
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import ModelLoader from "../Three/ModelLoader.ts";

export default class Asteroid
{

	protected texture : string;
	protected material : string;

	public mesh : THREE.Mesh | null = null;

	constructor(texture : string, material : string) {
		this.texture = texture;
		this.material = material;
	}

	public async load(){
		this.mesh = await this.createBody();
	}

	public addToScene(scene : THREE.Scene){
		scene.add(this.mesh!);
	}

	protected async createBody(){

		let asteroid = await new ModelLoader(this.texture, this.material).load();

		let scale = THREE.MathUtils.randFloat(0.0001, 0.03);

		asteroid.scale.set(scale, scale, scale);
		asteroid.rotation.x = Math.PI * THREE.MathUtils.randFloat(-2, 2);
		asteroid.rotation.y = Math.PI * THREE.MathUtils.randFloat(-2, 2);
		asteroid.rotation.z = Math.PI * THREE.MathUtils.randFloat(-2, 2);

		// ship.scale.set(0.15, 0.15, 0.15);

		// ship.rotation.x = 1.5;
		// ship.position.set(10, 10, 0);

		return asteroid;

	}

}