import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

//@ts-ignore
import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";
import WarShip from "./WarShip";
import {Object3D} from "three";
import BulletsContainer from "./BulletsContainer";
import Random from "../../Three/Random";
import Hittable from "./Hittable";

export default abstract class Enemy extends WarShip implements Hittable
{

	public health : number;
	public isVisible : boolean = true;

	protected autoFireActive : boolean = false;
	protected autoFireInterval : number = 1000;
	protected autoFireLastTime : number = 0;
	protected startHealth : number;

	protected bulletColor = 'red';
	protected bulletGlowColor = 'red';

	protected hp : CSS2DObject;
	protected attackTarget : Object3D | null = null;

	constructor(health : number, startX : number = 0, startY : number = 0, bulletsContainer : BulletsContainer) {

		super(startX, startY, 0.05, bulletsContainer);

		this.health = health;
		this.startHealth = health;

		this.hp = this.createHp();

		//Добавляем на сцену
		this.add(this.hp);

	}

	protected createHp() : CSS2DObject
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

	protected createHitLabel(text : string) : CSS2DObject
	{

		let div = document.createElement('div');
		div.className = 'hit';
		div.textContent = text;

		let label = new CSS2DObject(div);
		label.position.set(0, 0, 1);

		return label;

	}

	protected explosion(){

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

	public startAutoFire(){
		this.autoFireActive = true;
	}

	public stopAutoFire(){
		this.autoFireActive = false;
	}

	public setAttackTarget(object : Object3D){
		this.attackTarget = object;
	}

	public async animate(){

		//Автоматический огонь
		let now = Date.now();

		if(this.autoFireActive && now - this.autoFireLastTime > this.autoFireInterval){
			this.fire();
			this.autoFireLastTime = now;
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
			let percent = Math.ceil((this.health / this.startHealth) * 100);
			let color = percent > 50 ? 'green' : percent > 20 ? 'orange' : 'red';


			this.hp.element.className = `health health--${color}`;
			this.hp.element.children[0].style.width = percent + '%';

		}else{

			this.remove(this.hp);

			this.stop();
			this.explosion();

		}

		return true;

	}

}