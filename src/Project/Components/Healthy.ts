import * as THREE from 'three';

export default interface Healthy extends THREE.Object3D
{
	health : number;
	maxHealth : number;
	heal(health : number) : void;
}