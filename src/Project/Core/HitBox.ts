import * as THREE from "three";
import {Box3, Object3D, Vector3} from "three";

interface HitBoxCacheItem{
	target : Object3D,
	size : Vector3
}


export default class HitBox extends Box3
{

	private static cachedTargets : HitBoxCacheItem[] = [];

	private static getBox3(object : THREE.Object3D) : Box3
	{
		return new Box3().setFromObject(object)
	}

	private static getCachedBox3(object : THREE.Object3D) : Box3
	{

		let item = HitBox.cachedTargets.find(cache => cache.target === object);

		if(item){

			let position = new Vector3;

			object.getWorldPosition(position)

			return new Box3().setFromCenterAndSize(position, item.size);
		}

		let box = HitBox.getBox3(object);

		HitBox.cachedTargets.push({
			target : object,
			size : new Vector3().subVectors(box.max, box.min)
		})

		return box;

	}

	public static getFor(object : THREE.Object3D, useCache : boolean = false) : Box3
	{
		return useCache ? HitBox.getCachedBox3(object) : HitBox.getBox3(object);
	}



}