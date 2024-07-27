import Component from "../Core/Component";
import * as THREE from 'three';
import {Vector3} from "three";
import Random from "../../Three/Random";

export default abstract class Drop<T extends THREE.Object3D> extends Component
{

	public isUsed : boolean = false;
	public movingTarget : T | null = null;

	protected spawnMovingActive : boolean = false;
	protected spawnMovingPoint : Vector3 | null = null;

	public trash(){
		this.isUsed = true;
	}

	public setMovingTarget(target : T){
		this.movingTarget = target;
	}

	public clearMovingTarget(){
		this.movingTarget = null;
	}

	public startSpawnMoving(to : Vector3){
		this.spawnMovingActive = true;
		this.spawnMovingPoint = to.clone();
	}

	public cancelSpawnMoving(){
		this.spawnMovingActive = false;
		this.spawnMovingPoint = null;
	}

	public abstract use(target : T) : void;

	public animate(){

		if(this.isUsed){
			return;
		}

		if(this.movingTarget) {

			let direction = new Vector3().subVectors(this.movingTarget.position, this.position),
				distance = direction.length();

			if(distance < 2) {

				this.use(this.movingTarget);

				this.isUsed = true;

			}else{

				direction.normalize();

				this.position.add(
					direction.multiplyScalar(0.1)
				);

			}

		}else if(this.spawnMovingActive && this.spawnMovingPoint) {

			let direction = new Vector3().subVectors(this.spawnMovingPoint, this.position),
				distance = direction.length();

			if(distance > 0.3){

				direction.normalize();

				this.position.add(
					direction.multiplyScalar(0.1)
				);

			}else{

				this.cancelSpawnMoving();

			}

		}

	}

}