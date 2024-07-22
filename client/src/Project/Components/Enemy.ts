import Component from "../Core/Component.ts";
import * as THREE from 'three';
import ModelLoader from "../../Three/ModelLoader.ts";
import * as TWEEN from '@tweenjs/tween.js';

//@ts-ignore
import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";

export default class Enemy extends Component
{

	public isVisible : boolean = true;

	public health : number;
	public startHealth : number;

	public startX : number;
	public startY : number;

	public group : THREE.Group | null = null;
	public mesh : THREE.Mesh | null = null;
	public hp : CSS2DObject | null = null;

	constructor(health : number, startX : number = 0, startY : number = 0) {
		super();
		this.startY = startY;
		this.startX = startX;
		this.health = health;
		this.startHealth = health;
	}

	public async load() : Promise<this>{

		this.group = await this.createGroup();
		this.mesh = await this.createBody();
		this.hp = await this.createHp();

		return this;

	}

	public addTo(scene: THREE.Scene) {

		this.group!.add(this.mesh!);
		this.group!.add(this.hp);

		scene.add(this.group!);

	}

	protected async createGroup() : Promise<THREE.Group>
	{

		let group = new THREE.Group();

		group.position.set(
			THREE.MathUtils.randInt(1, 40),
			THREE.MathUtils.randInt(1, 40)
			, 0
		);

		return group;

	}

	protected async createHp() : Promise<CSS2DObject>
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

	protected async createBody() : Promise<THREE.Mesh>
	{

		let ship = await new ModelLoader('../../assets/ship/ship.obj', '../../assets/ship/ship.mtl').load();

		ship.scale.set(0.15, 0.15, 0.15);

		ship.rotation.x = 1.5;

		return ship;

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
			rotationZ : this.mesh!.rotation.z,
			rotationX : this.mesh!.rotation.x,
			position : this.mesh!.position.z
		}

		new TWEEN.Tween(props)
			.to({ rotationZ : Math.PI / 2, position : - 20, rotationX : Math.PI / 4 }, 5000)
			.onUpdate(() => {
				this.mesh!.position.z = props.position;
				this.mesh!.rotation.z = props.rotationZ;
				this.mesh!.rotation.x = props.rotationX;
			})
			.onComplete(() => {
				this.isVisible = false;
			})
			.start();

	}

	public hit(force : number) : boolean
	{

		if(!this.health){
			return false;
		}

		this.health = Math.max(0, this.health - force);

		if(this.health) {

			let label = this.createHitLabel('-' + force);

			label.position.x = THREE.MathUtils.randFloat(-1.25, 1.25);
			label.position.y = THREE.MathUtils.randFloat(-1.25, 1.25);

			this.group!.add(label);

			setTimeout(() => this.group!.remove(label), 500);


			//Обновляем здоровье
			let percent = Math.ceil((this.health / this.startHealth) * 100);
			let color = percent > 50 ? 'green' : percent > 20 ? 'orange' : 'red';


			this.hp.element.className = `health health--${color}`;
			this.hp.element.children[0].style.width = percent + '%';

		}else{

			this.group!.remove(this.hp);

			this.explosion();

		}

		return true;

	}

}