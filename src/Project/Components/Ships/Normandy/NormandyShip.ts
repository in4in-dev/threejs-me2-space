import WarShip from "../../WarShip";
import * as THREE from "three";
import ModelLoader from "../../../../Three/ModelLoader";
import NormandyEngine from "./NormandyEngine";
import NormandyEngines from "./NormandyEngines";
import AttacksContainer from "../../../Containers/AttacksContainer";
import Hittable from "../../../Contracts/Hittable";
import {Vector3} from "three";
import Random from "../../../../Three/Random";
import LaserBulletAttack from "../../Attacks/LaserBulletAttack";
import ShockWaveAttack from "../../Attacks/ShockWaveAttack";
import Healthy from "../../../Contracts/Healthy";
import RocketBulletAttack from "../../Attacks/RocketBulletAttack";
import Enemy from "../../Enemy";
import Experienced from "../../../Contracts/Experienced";

export class NormandyShip extends WarShip implements Hittable, Healthy, Experienced
{

	public health : number;
	public maxHealth : number;
	public experience : number = 0;

	protected mesh : THREE.Group;
	protected light : THREE.Light;
	protected engines : NormandyEngines;

	protected bulletColor : any = '#ffffff';
	protected bulletGlowColor : any = '#1c80ff';

	protected rocketAttackTarget : THREE.Object3D | null = null;
	protected rocketAttackBullet : RocketBulletAttack | null = null;

	protected shockwaveAttackBullet : ShockWaveAttack | null = null;

	public fireLevel : number = 1;
	public shockWaveLevel : number = 1;
	public rocketLevel : number = 1;
	public healthLevel : number = 1;


	constructor(bulletGroup : AttacksContainer) {

		super(0.3, bulletGroup);

		this.maxHealth = 1200;
		this.health = this.maxHealth;

		this.light = this.createLight();
		this.engines = this.createEngines();
		this.mesh = this.createBody();

		//Добавляем на сцену
		this.mesh.add(this.engines.l1, this.engines.l2, this.engines.r1, this.engines.r2);

		this.add(this.mesh, this.light);


	}

	public setFireLevel(level : number) : this
	{
		this.fireLevel = level;
		return this;
	}

	public setShockwaveLevel(level : number) : this
	{
		this.shockWaveLevel = level;
		return this;
	}

	public setRocketLevel(level : number) : this
	{
		this.rocketLevel = level;
		return this;
	}

	public setHealthLevel(level : number) : this
	{
		this.healthLevel = level;
		this.maxHealth = level * 1200;
		return this;
	}

	protected createLight() : THREE.Light
	{

		let light = new THREE.PointLight('white', 1, 10);

		light.position.set(0, 0, 1);

		return light;

	}

	protected createBody() : THREE.Group
	{

		let ship = new ModelLoader('../../assets/mobs/normandy/normandy.obj', '../../../../assets/mobs/normandy/normandy.mtl').loadInBackground();

		ship.scale.set(0.15, 0.15, 0.15);
		ship.rotation.x = 1.5;

		return ship;

	}

	protected createEngines() : NormandyEngines
	{

		let engineLeft1 = new NormandyEngine('#0d4379', '#1d64a6', 0.4, 1.5),
			engineLeft2 = new NormandyEngine('#0d4379', '#1d64a6', 0.4, 2),
			engineRight1 = new NormandyEngine('#0d4379', '#1d64a6', 0.4, 1.5),
			engineRight2 = new NormandyEngine('#0d4379', '#1d64a6', 0.4, 2);

		engineRight1.position.set(-5, 0 ,0);
		engineRight2.position.set(-3, 0 ,0);

		engineLeft1.position.set(5, 0, 0);
		engineLeft2.position.set(3, 0, 0);

		return {
			l1 : engineLeft1,
			l2 : engineLeft2,
			r2 : engineRight2,
			r1 : engineRight1
		}

	}

	public startEngines() : void
	{

		this.engines.l1.setLength(8).setSpeed(1);
		this.engines.r1.setLength(8).setSpeed(1);

		this.engines.l2.setLength(10).setSpeed(1);
		this.engines.r2.setLength(10).setSpeed(1);

	}

	public stopEngines() : void
	{

		this.engines.l1.setLength(1.5).setSpeed(0.4);
		this.engines.r1.setLength(1.5).setSpeed(0.4);

		this.engines.l2.setLength(2).setSpeed(0.4);
		this.engines.r2.setLength(2).setSpeed(0.4);

	}

	public animate(){

		this.engines.r1.animate();
		this.engines.r2.animate();
		this.engines.l1.animate();
		this.engines.l2.animate();

		if(this.rocketAttackBullet && this.rocketAttackTarget){

			if(this.rocketAttackBullet.isVisible){
				this.rocketAttackBullet.updateTo(
					this.rocketAttackTarget.position
				)
			}else{
				this.rocketAttackBullet = null;
				this.rocketAttackTarget = null;
			}

		}

		if(this.shockwaveAttackBullet){

			if(this.shockwaveAttackBullet.isVisible){
				this.shockwaveAttackBullet.updateFrom(this.position);
			}else{
				this.shockwaveAttackBullet = null;
			}

		}

	}

	public hit(x : number){
		this.health = Math.max(0, this.health - x);
	}

	public fire(){

		let to = new THREE.Vector3(0, -1, 0).applyQuaternion(this.quaternion).multiplyScalar(999);

		let bullet1 = new LaserBulletAttack(
			new Vector3(this.position.x + 0.3, this.position.y - 0.3, -1),
			to,
			Random.int(this.fireLevel, this.fireLevel * 5),
			this.bulletColor,
			this.bulletGlowColor
		);

		let bullet2 = new LaserBulletAttack(
			new Vector3(this.position.x - 0.3, this.position.y - 0.3, -1),
			to,
			Random.int(this.fireLevel, this.fireLevel * 5),
			this.bulletColor,
			this.bulletGlowColor
		);

		this.attacksContainer.addAttacks(bullet1, bullet2);

	}

	public shockwaveFire() {

		let bullet = new ShockWaveAttack(
			this.position,
			this.shockWaveLevel * 10,
			20,
			'white',
			this
		);

		bullet.position.y += 7;
		bullet.position.z = -1;

		this.attacksContainer.addAttacks(bullet);

		this.shockwaveAttackBullet = bullet;

	}

	public rocketFire(to : THREE.Object3D){

		let bullet = new RocketBulletAttack(
			this.position,
			to.position,
			this.rocketLevel * 150
		)

		this.rocketAttackTarget = to;
		this.rocketAttackBullet = bullet;

		this.attacksContainer.addAttacks(bullet);

	}

	public heal(x : number){
		this.health = Math.min(this.maxHealth, this.health + x);
	}

	public exp(exp : number){
		this.experience += exp;
	}

	public spendExp(value : number) : boolean
	{

		if(this.experience < value){
			return false;
		}

		this.experience -= value;
		return true;

	}


}