import Mob from "../Mob";
import {Vector3} from "three";
import * as THREE from "three";
import AttacksContainer from "../../Containers/AttacksContainer";
import ModelLoader from "../../../Three/ModelLoader";
import Random from "../../../Three/Random";
import BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export default class FriendRelay extends Mob
{

	public level : number;

	protected mesh : THREE.Group;
	protected shield : THREE.Points;

	protected shieldEnabled : boolean = false;
	protected shieldStartTime : number = 0;
	protected shieldEndTime : number = 0;
	protected shieldMaxRadius : number = 8;

	public constructor(
		level : number,
		bulletsContainer : AttacksContainer
	) {
		super(7000 * level,0.00001, bulletsContainer);

		this.level = level;
		this.mesh = this.createBody();
		this.shield = this.createShield();

		this.add(this.shield);
		this.add(this.mesh);
	}

	protected generateShieldGeometry(radius : number){

		// Установить необходимые параметры
		// let outerRadius = radius;
		// let thickness = 1;
		// let innerRadius = outerRadius - thickness;

		let points = [];
		for (let i = 0; i < 3000; i++) {
			let phi = Math.acos(2 * Math.random() - 1);
			let theta = 2 * Math.PI * Math.random();
			let x = radius * Math.sin(phi) * Math.cos(theta);
			let y = radius * Math.sin(phi) * Math.sin(theta);
			let z = radius * Math.cos(phi);
			points.push(new THREE.Vector3(x, y, z));
		}

		return new THREE.BufferGeometry().setFromPoints(points);


	}

	protected createShield() : THREE.Points
	{

		let particleTexture = new THREE.TextureLoader().load('../../../../assets/sand.png');

		return new THREE.Points(
			this.generateShieldGeometry(0),
			new THREE.PointsMaterial({
				transparent : true,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				color : '#2289c4',
				// opacity: 0.25,
				size : 0.3 ,
				map : particleTexture
			})
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

			let outSideSphere = this.generateShieldGeometry(radius);

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