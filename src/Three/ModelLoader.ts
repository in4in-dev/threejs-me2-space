import * as THREE from 'three';
//@ts-ignore
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
//@ts-ignore
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {Object3D} from "three";

interface ModelLoaderBackgroundCallback
{
	(obj : THREE.Object3D) : THREE.Object3D
}

interface ModelLoaderBackgroundTask
{
	texture : string,
	group : THREE.Group,
	callback : ModelLoaderBackgroundCallback | null
}

export default class ModelLoader
{

	protected static backgroundTasks : ModelLoaderBackgroundTask[] = [];

	protected static cacheTextures : any = {};
	
	public texture : string;
	public material : string | null;
	
	constructor(texture : string, material : string | null = null) {
		this.texture = texture;
		this.material = material;
	}
	
	protected static async loadMaterial(path : string) : Promise<THREE.Material>
	{

		let mtlLoader = new MTLLoader();
		
		let material = await mtlLoader.loadAsync(path);
		material.preload();
		
		return material;
		
	}
	
	protected static async loadModel(path : string, material : THREE.Material | null) : Promise<THREE.Object3D>
	{
		let objLoader = new OBJLoader();

		if(material){
			objLoader.setMaterials(material);
		}
		
		return await objLoader.loadAsync(path);

	}
	
	public async load() : Promise<Object3D>
	{

		if(!(this.texture in ModelLoader.cacheTextures)){

			let material = this.material
				? await ModelLoader.loadMaterial(this.material)
				: null;

			ModelLoader.cacheTextures[this.texture] = await ModelLoader.loadModel(this.texture, material);

		}

		return ModelLoader.cacheTextures[this.texture].clone();
		
	}

	public loadInBackground(callback : null | ((obj : THREE.Object3D) => THREE.Object3D) = null) : THREE.Group
	{

		let group = new THREE.Group();

		if(
			!ModelLoader.backgroundTasks.find(task => task.texture === this.texture) &&
			!(this.texture in ModelLoader.cacheTextures)
		){
			this.load();
		}

		ModelLoader.backgroundTasks.push({
			texture : this.texture,
			group,
			callback
		});

		return group;

	}

	public static runBackgroundTasks(){

		ModelLoader.backgroundTasks = ModelLoader.backgroundTasks.filter(task => {

			if(task.texture in ModelLoader.cacheTextures){

				let texture = ModelLoader.cacheTextures[task.texture].clone();

				task.group.add(
					task.callback ? task.callback(texture) : texture
				);

				return false;

			}

			return true;

		});

	}


}