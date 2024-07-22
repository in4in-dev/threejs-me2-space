import * as THREE from 'three';

export default abstract class Component
{

	public abstract load() : Promise<this>;

	public abstract addTo(element : THREE.Object3D) : void;

}