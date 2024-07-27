import * as THREE from 'three';

export default interface Experienced extends THREE.Object3D
{
	experience : number;
	exp(value : number) : void;
	spendExp(value : number) : boolean;
}