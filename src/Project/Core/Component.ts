import * as THREE from 'three';

export default abstract class Component extends THREE.Group
{

	// public abstract load() : Promise<this>;

	public async animate(): Promise<void>
	{

	}

}