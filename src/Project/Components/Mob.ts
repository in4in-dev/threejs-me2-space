import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';

//@ts-ignore
import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";
import WarShip from "./WarShip";
import AttacksContainer from "./../Containers/AttacksContainer";
import Random from "../../Three/Random";
import Hittable from "./../Contracts/Hittable";
import {Animation, AnimationThrottler} from "../../Three/Animation";
import Healthy from "./../Contracts/Healthy";

export default abstract class Mob extends WarShip implements Hittable, Healthy
{

	public health : number;
	public maxHealth : number;

	public isVisible : boolean = true;

	protected autoFireActive : boolean = false;
	protected autoFireMinDistance : number = 50;
	protected autoFireThrottler : AnimationThrottler = Animation.createThrottler(2000);

	protected hp : CSS2DObject;
	protected attackTarget : THREE.Object3D | null = null;

	constructor(
		health : number,
		speed : number = 0.05,
		bulletsContainer : AttacksContainer
	) {

		super(speed, bulletsContainer);

		this.health = health;
		this.maxHealth = health;

		this.hp = this.createHp();

		//Добавляем на сцену
		this.add(this.hp);


	}

	private createHp() : CSS2DObject
	{

		let wrap = document.createElement('div');
		wrap.className = 'health health--green';

		let bar = document.createElement('div');
		bar.className = 'health__bar';

		wrap.appendChild(bar);

		let label = new CSS2DObject(wrap);

		label.position.set(0, 0, 1);

		return label;

	}

	private createHitLabel(text : string) : CSS2DObject
	{

		let div = document.createElement('div');
		div.className = 'hit';
		div.textContent = text;

		let label = new CSS2DObject(div);

		label.position.set(0, 0, 1);

		return label;

	}

	protected explosion() : void
	{

		let props = {
			rotationZ : this.rotation.z,
			rotationX : this.rotation.x,
			position : this.position.z
		}

		new TWEEN.Tween(props)
			.to({ rotationZ : Math.PI / 2, position : - 20, rotationX : Math.PI / 4 }, 5000)
			.onUpdate(() => {
				this.position.z = props.position;
				this.rotation.z = props.rotationZ;
				this.rotation.x = props.rotationX;
			})
			.onComplete(() => {
				this.isVisible = false;
			})
			.start();

	}

	public startAutoFire() : void
	{
		this.autoFireActive = true;
	}

	public stopAutoFire() : void
	{
		this.autoFireActive = false;
	}

	public setNearestAttackTarget(objects : THREE.Object3D[], maxDistance : number = Infinity) : void
	{

		let target = this.whoNearest(objects, maxDistance);

		if(target){
			this.setAttackTarget(target);
		}else{
			this.clearAttackTarget();
		}

	}

	public clearAttackTarget() : void
	{
		this.attackTarget = null;
	}

	public setAttackTarget(object : THREE.Object3D) : void
	{
		this.attackTarget = object;
	}

	public hasAttackTarget() : boolean
	{
		return !!this.attackTarget;
	}

	public animate() : void
	{

		if(this.autoFireActive && this.attackTarget && this.attackTarget.position.distanceTo(this.position) < this.autoFireMinDistance){
			this.autoFireThrottler(() => this.fire(this.attackTarget!.position));
		}

	}

	public hit(force : number) : boolean
	{

		if(!this.health){
			return false;
		}

		this.health = Math.max(0, this.health - force);

		if(this.health) {

			let label = this.createHitLabel('-' + force);

			label.position.x = Random.float(-1.25, 1.25);
			label.position.y = Random.float(-1.25, 1.25);

			this.add(label);

			setTimeout(() => this.remove(label), 500);


			//Обновляем здоровье
			let percent = Math.ceil((this.health / this.maxHealth) * 100);
			let color = percent > 50 ? 'green' : percent > 20 ? 'orange' : 'red';


			this.hp.element.className = `health health--${color}`;
			this.hp.element.children[0].style.width = percent + '%';

		}else{

			this.remove(this.hp);
			this.explosion();

		}

		return true;

	}

	public heal(h : number) : void
	{
		this.health = Math.min(this.maxHealth, this.health + h);
	}

}