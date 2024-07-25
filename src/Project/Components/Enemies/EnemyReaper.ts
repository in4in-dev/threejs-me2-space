import Enemy from "../Enemy";
import * as THREE from 'three';
import {Scene, Vector3} from "three";
import ModelLoader from "../../../Three/ModelLoader";
import AttacksContainer from "../AttacksContainer";
import RayBulletAttack from "../Attacks/RayBulletAttack";
import Random from "../../../Three/Random";
import HealsContainer from "../HealsContainer";

export default class EnemyReaper extends Enemy
{

	protected mesh : THREE.Group | null = null;
	protected bullet : RayBulletAttack | null = null;

	constructor(
		x : number,
		y : number,
		speed : number,
		attacksContainer : AttacksContainer,
		healsContainer : HealsContainer
	) {

		super(x, y, speed, attacksContainer, healsContainer);

		this.mesh = this.createBody();

		//Добавляем на сцену
		this.add(this.mesh!);

	}

	public animate()
	{

		//Движение до цели
		if(this.attackTarget){

			if(this.bullet){
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
			'../../assets/reaper/reaper.obj',
			'../../assets/reaper/reaper.mtl'
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
			this.position.clone().setZ(-1).add(new Vector3(0, 1 , 0)),
			to,
			Random.int(10, 50),
			'red'
		);

		this.attacksContainer.addAttacks(bullet);

		this.bullet = bullet;

	}

	public altFire(to: Vector3) {

	}

}