import * as THREE from 'three';

export default interface Hittable extends THREE.Object3D
{
	hit(force : number) : void;
}