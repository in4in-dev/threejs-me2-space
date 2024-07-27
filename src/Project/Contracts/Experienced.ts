import * as THREE from 'three';

export default interface Experienced extends THREE.Object3D
{
	exp(value : number) : void;
}