import Mob from "../Mob";
import {Vector3} from "three";
import * as THREE from "three";
import AttacksContainer from "../../Containers/AttacksContainer";
import ModelLoader from "../../../Three/ModelLoader";

export default class FriendRelay extends Mob
{

	protected mesh : THREE.Group;
	protected shield : THREE.Mesh;

	protected shieldEnabled : boolean = false;
	protected shieldStartTime : number = 0;
	protected shieldEndTime : number = 0;
	protected shieldMaxRadius : number = 8;

	public constructor(
		health : number,
		startX : number = 0,
		startY : number = 0,
		bulletsContainer : AttacksContainer
	) {
		super(health, startX, startY, 0.00001, bulletsContainer);

		this.mesh = this.createBody();
		this.shield = this.createShield();

		this.add(this.shield);
		this.add(this.mesh);
	}

	protected createShield() : THREE.Mesh
	{
		return new THREE.Mesh(
			new THREE.SphereGeometry(0, 50, 50),
			new THREE.MeshBasicMaterial({ color : '#2289c4', transparent : true, opacity: 0.15 })
		);
	}

	protected createBody() : THREE.Group
	{

		let mesh = new ModelLoader(
			'../../../../assets/mobs/relay/relay.obj',
			'../../../../assets/mobs/relay/relay.mtl',
		).loadInBackground();

		mesh.rotation.x = 1.5;
		mesh.scale.set(4.5, 4.5, 4.5);

		return mesh;

	}

	public activateShield(time : number){

		this.shieldEnabled = true;
		this.shieldStartTime = Date.now();
		this.shieldEndTime = Date.now() + time;

	}

	public animate(){

		let now = Date.now();

		if(now > this.shieldEndTime){
			this.shieldEnabled = false;
		}

		if(this.shieldEnabled){

			//Анимируем щит
			let shieldDuration = (this.shieldEndTime - this.shieldStartTime),
				progress = (Date.now() - this.shieldStartTime) / shieldDuration,
				explosionDuration = 500 / shieldDuration,
				explosionProgress = progress < explosionDuration
					? (progress / explosionDuration)
					: progress > (1 - explosionDuration)
						? ((1 - progress) / explosionDuration)
						: 1;

			let radius = explosionProgress * this.shieldMaxRadius;

			let outSideSphere = new THREE.SphereGeometry(radius, 50, 50);

			this.shield.geometry.copy(outSideSphere);

		}

	}

	public hit(damage : number) : boolean
	{

		if(!this.shieldEnabled){
			return super.hit(damage);
		}

		return false;

	}

	fire(to: Vector3): void {}

}