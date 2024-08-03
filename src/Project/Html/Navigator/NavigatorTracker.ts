import HtmlComponent from "../../Core/HtmlComponent";
import * as THREE from "three";
import Ship from "../../Components/Ship";
import {Vector2, Vector3} from "three";

export default abstract class NavigatorTracker extends HtmlComponent
{

	protected target : THREE.Object3D;
	protected ship : Ship;
	protected camera : THREE.Camera;

	constructor(target : THREE.Object3D, camera : THREE.Camera, ship : Ship) {
		super();

		this.target = target;
		this.camera = camera;
		this.ship = ship;
	}

	protected isObjectInView() {

		let frustum = new THREE.Frustum();
		let cameraViewProjectionMatrix = new THREE.Matrix4();

		this.camera.updateMatrixWorld();
		cameraViewProjectionMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
		frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

		return frustum.intersectsObject(this.target);
	}

	protected getDirection() : Vector2
	{

		let positionShip = new THREE.Vector3();
		this.ship.getWorldPosition(positionShip);

		const positionTarget = new THREE.Vector3();
		this.target.getWorldPosition(positionTarget);

		return new Vector2().subVectors(positionTarget, positionShip).normalize();

	}

	protected getFlagPositionFor(direction : Vector2) {

		let width = window.innerWidth,
			height = window.innerHeight,
			margin = 10,
			size = 40,
			top, left;

		if(Math.abs(direction.y) > Math.abs(direction.x)){

			//Сверху или снизу
			if(direction.y < 0){
				top = height - (size + margin);
			}else{
				top = 0 + margin;
			}

			left = (width / 2) - width * (-direction.x / Math.abs(direction.y));
			left = Math.max(0 + margin, left);
			left = Math.min(width - (size + margin), left);

		}else{

			//Слева или справа
			if(direction.x < 0){
				left = 0 + margin;
			}else{
				left = width - (size + margin);
			}

			top = (height / 2) + height * (-direction.y / Math.abs(direction.x));
			top = Math.max(top, 0 + margin);
			top = Math.min(height - (size + margin), top);

		}

		return {top, left};

	}

	public updateView(){

		if (!this.isObjectInView()) {

			const flagPosition = this.getFlagPositionFor(
				this.getDirection()
			);

			this.element.style.left = `${flagPosition.left}px`;
			this.element.style.top = `${flagPosition.top}px`;
			this.element.style.display = 'block';

		} else {

			this.element.style.display = 'none';

		}

	}

}