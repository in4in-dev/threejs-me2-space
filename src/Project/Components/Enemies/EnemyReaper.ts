import * as THREE from 'three';
import {Vector3} from 'three';
import ModelLoader from "../../../Three/ModelLoader";
import AttacksContainer from "../../Containers/AttacksContainer";
import RayBulletAttack from "../Attacks/RayBulletAttack";
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
	protected rayAttack : RayBulletAttack | null = null;

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

	protected createBody() : THREE.Group
	{

		let ship = new ModelLoader(
			'../../../assets/mobs/reaper/reaper.obj',
			'../../../assets/mobs/reaper/reaper.mtl'
		).loadInBackground((obj : any) => {
			return obj.children[0].material.color.set('black'), obj;
		});

		ship.scale.set(0.05, 0.05, 0.05);
		ship.rotation.set(0.3, 4.7, 0);
		ship.position.set(0, -3, -1);


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

		let group = new THREE.Group;

		group.add(ship, glow);

		return group;

	}

	public fire(to : Vector3) : void
	{

		let attack = new RayBulletAttack(
			this.position.clone().setZ(-1.5).add(new Vector3(0, 1 , 0)),
			to,
			20 * this.level,
			'red'
		);

		this.attacksContainer.addAttacks(attack);

		this.rayAttack = attack;

	}

	public animate()
	{

		if(this.attackTarget){

			//Обновляем луч
			if(this.rayAttack){

				if(!this.rayAttack.visible){
					this.rayAttack = null;
				}else{
					this.rayAttack.updateStartPoint(this.position);
					this.rayAttack.updateTarget(this.attackTarget.position);
				}

			}

			//Движение до цели
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


}