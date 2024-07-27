import * as THREE from 'three';
import {Scene, Vector3} from "three";
import ModelLoader from "../../../Three/ModelLoader";
import AttacksContainer from "../../Containers/AttacksContainer";
import RayBulletAttack from "../Attacks/RayBulletAttack";
import Random from "../../../Three/Random";
import DropContainer from "../../Containers/DropContainer";
import Enemy from "../Enemy";
import Healthy from "../../Contracts/Healthy";
import Heal from "../Heal";
import Experienced from "../../Contracts/Experienced";
import Experience from "../Experience";

export default class EnemyReaper extends Enemy
{

	public level : number = 1;

	protected mesh : THREE.Group;
	protected bullet : RayBulletAttack | null = null;

	protected autoFireMinDistance : number = 30;

	constructor(
		level : number,
		attacksContainer : AttacksContainer,
		healsContainer : DropContainer<Healthy, Heal>,
		expContainer : DropContainer<Experienced, Experience>
	) {

		super(100 * level, 0.05, attacksContainer, healsContainer, expContainer);

		this.level = level;
		this.mesh = this.createBody();

		//Добавляем на сцену
		this.add(this.mesh!);

	}

	public animate()
	{

		//Движение до цели
		if(this.attackTarget){

			if(this.bullet && this.bullet.isVisible){
				this.bullet.updateStartPoint(this.position);
				this.bullet.updateTarget(this.attackTarget.position);
			}

			let distance = this.position.distanceTo(this.attackTarget.position);

			if(distance > 10){

				this.moveTo(this.attackTarget.position);

				if(distance > 20){
					this.setSpeed(0.05);
				}else{
					this.setSpeed(0.02);
				}

			}else{
				this.stop();
				this.rotateTo(this.attackTarget.position);
			}


		}

		//Автоматический огонь
		super.animate();

	}

	protected createBody() : THREE.Group
	{

		let group = new THREE.Group;

		let ship = new ModelLoader(
			'../../../assets/mobs/reaper/reaper.obj',
			'../../../assets/mobs/reaper/reaper.mtl'
		).loadInBackground((obj : any) => {
			return obj.children[0].material.color.set('black'), obj;
		});

		ship.scale.set(0.05, 0.05, 0.05);

		ship.rotation.y = 4.7;
		ship.rotation.x = 0.3;

		ship.position.z = -1;
		ship.position.y = -3;


		let glow = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.TextureLoader().load('../../../../assets/glow.png'),
				color: 'red', // Цвет свечения
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite:false,
				opacity : 0.2
			})
		)

		glow.scale.set(2, 2, 2);
		glow.position.set(0, 0, -1);

		group.add(ship);
		group.add(glow);

		return group;

	}

	public fire(to : Vector3){

		let bullet = new RayBulletAttack(
			this.position.clone().setZ(-1.5).add(new Vector3(0, 1 , 0)),
			to,
			20 * this.level,
			'red'
		);

		this.attacksContainer.addAttacks(bullet);

		this.bullet = bullet;

	}

	public altFire(to: Vector3) {

	}

}