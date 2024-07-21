import * as THREE from 'three';
//@ts-ignore
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
//@ts-ignore
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";

export default class ModelLoader
{
	
	protected static cacheTextures : any = {};
	
	public texture : string;
	public material : string | null;
	
	constructor(texture : string, material : string | null = null) {
		this.texture = texture;
		this.material = material;
	}
	
	public static async loadMaterial(path : string) : Promise<THREE.Material>
	{

		let mtlLoader = new MTLLoader();
		
		let material = await mtlLoader.loadAsync(path);
		material.preload();
		
		return material;
		
	}
	
	public static async loadModel(path : string, material : THREE.Material | null) : Promise<THREE.Group>
	{
		let objLoader = new OBJLoader();

		if(material){
			objLoader.setMaterials(material);
		}
		
		return await objLoader.loadAsync(path);

	}
	
	public async load(){

		if(!(this.texture in ModelLoader.cacheTextures)){


			let material = this.material
				? await ModelLoader.loadMaterial(this.material)
				: null;


			ModelLoader.cacheTextures[this.texture] = await ModelLoader.loadModel(this.texture, material);

		}


		return ModelLoader.cacheTextures[this.texture].clone();
		
	}
	
}