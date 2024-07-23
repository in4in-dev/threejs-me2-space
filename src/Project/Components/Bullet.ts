import Component from "../Core/Component";
import * as THREE from 'three';
import {Vector3} from "three";

export default class Bullet extends Component
{

	public isMoving : boolean = true;
	public isVisible : boolean = true;

	public fromX : number;
	public fromY : number;
	public toX : number;
	public toY : number;
	public color : any;
	public glowColor : any;
	public force : number;

	public length : number = 0;

	public mesh : THREE.Mesh | null = null;
	public glow : THREE.Sprite | null = null;

	constructor(
		fromX : number,
		fromY : number,
		toX : number,
		toY : number,
		force : number,
		color : any,
		glowColor : any
	) {
		super();
		this.fromX = fromX;
		this.fromY = fromY;
		this.toX = toX;
		this.toY = toY;
		this.color = color;
		this.glowColor = glowColor;
		this.force = force;
	}

	public async load() : Promise<this>
	{
		this.mesh = await this.createMesh();
		this.glow = await this.createGlow();

		return this;
	}

	public addTo(group : THREE.Group)
	{

		this.mesh!.add(this.glow!);

		group.add(this.mesh!);

	}

	protected async createGlow() : Promise<THREE.Sprite>
	{

		let glowTexture = new THREE.TextureLoader().load('../../assets/glow.png');

		let glowMaterial = new THREE.SpriteMaterial({
			map: glowTexture,
			color: this.glowColor, // Цвет свечения
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite:false
		});

		let glowSprite = new THREE.Sprite(glowMaterial);
		glowSprite.scale.set(2, 0.5, 0.5);

		return glowSprite;

	}


	protected async createMesh(): Promise<THREE.Mesh>{

		let mesh = new THREE.Mesh(
			new THREE.SphereGeometry(0.1, 10, 10),
			new THREE.MeshBasicMaterial({color : this.color})
		);

		mesh.position.x = this.fromX;
		mesh.position.y = this.fromY;
		mesh.position.z = -0.1;

		mesh.scale.set(0.3, 1, 1);

		return mesh;

	}

	public stopMoving(){

		this.isMoving = false;

		this.mesh!.position.set(this.mesh!.position.x, this.mesh!.position.y, 0);

	}

	public hide(){
		this.isVisible = false;
	}

	public checkCollisionWith(object : THREE.Object3D) : boolean
	{

		let bulletBox = new THREE.Box3().setFromObject(this.mesh!);
		let objectBox = new THREE.Box3().setFromObject(object);

		return bulletBox.intersectsBox(objectBox)

	}

	public boof(){

		(<THREE.MeshBasicMaterial>this.mesh!.material).color.set('#757575');
		this.glow!.material.color.set('#888888');
		this.glow!.material.opacity = 0.2;
		this.glow!.scale.set(4, 2, 2);

		this.stopMoving();

		setTimeout(() => this.isVisible = false, 500);

	}

	public boom(){

		(<THREE.MeshBasicMaterial>this.mesh!.material).color.set('#ffac70');
		this.glow!.material.color.set('#ff8b33');
		this.glow!.material.opacity = 0.2;
		this.glow!.scale.set(4, 2, 2);

		this.stopMoving();

		setTimeout(() => this.isVisible = false, 500);

	}


	public animate(){

		if(this.isMoving) {

			this.mesh!.position.add(new Vector3(this.toX, this.toY, 0));

			this.length = this.mesh!.position.length();

		}

	}

}