import Mob from "../Mob";
import {Vector3} from "three";
import * as THREE from "three";
import AttacksContainer from "../../Containers/AttacksContainer";
import ModelLoader from "../../../Three/ModelLoader";
//@ts-ignore
import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";
//@ts-ignore
import {CSS3DObject} from "three/examples/jsm/renderers/CSS3DRenderer";
import {Animation, AnimationThrottler} from "../../../Three/Animation";
import Sparks from "../Sparks";
import RelayDestoyAttack from "../Attacks/RelayDestoyAttack";
import Random from "../../../Three/Random";

export default class FriendRelay extends Mob
{

	public level : number;
	public letter : string;

	protected relayGroup : THREE.Group;
	protected mesh : THREE.Group;
	protected letterMesh : CSS3DObject;
	protected shield : THREE.Points;
	protected sparks : Sparks;
	protected glow : THREE.Sprite;

	protected shieldEnabled : boolean = false;
	protected shieldStartTime : number = 0;
	protected shieldEndTime : number = 0;
	protected shieldMaxRadius : number = 8;

	protected relayHelpThrottler : AnimationThrottler = Animation.createThrottler(200);

	public constructor(
		letter : string,
		level : number,
		bulletsContainer : AttacksContainer
	) {
		super(7000 * level,0.00001, bulletsContainer);

		this.level = level;
		this.letter = letter;
		this.relayGroup = new THREE.Group;

		this.mesh = this.createBody();
		this.shield = this.createShield();
		this.letterMesh = this.createLetter(letter);
		this.sparks = this.createSparks();
		this.glow = this.createGlow();

		this.relayGroup.add(this.shield, this.mesh, this.sparks, this.glow);

		this.add(this.letterMesh, this.relayGroup);

	}

	protected createGlow() : THREE.Sprite
	{

		let textures = [
			'../../../../assets/light.png',
			'../../../../assets/glow.png'
		];

		let glowTexture = new THREE.TextureLoader().load(Random.arr(textures));

		let glowMaterial = new THREE.SpriteMaterial({
			map: glowTexture,
			color: '#2289c4', // Цвет свечения
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite:false,
			opacity: Random.float(0.4, 0.8)
		});

		let glowSprite = new THREE.Sprite(glowMaterial);
		glowSprite.scale.set(12, Random.int(6, 12), 12);

		// glowSprite.position.y = -2;
		glowSprite.position.x = 0;

		return glowSprite;
	}

	protected createSparks() : Sparks
	{
		let sparks = new Sparks(0.2, '#04334f', 0.4);

		sparks.position.y = -0.5;
		// sparks.position.x = -2;

		return sparks;
	}

	protected createLetter(letter : string) : CSS3DObject
	{

		let wrap = document.createElement('div');
		wrap.className = 'relay-letter';
		wrap.textContent = letter;

		let label = new CSS3DObject(wrap);
		label.position.set(-10, -9, 7);

		label.scale.set(0.05, 0.05, 0.05);
		label.rotation.x = Math.PI * 1.5;
		label.rotation.y = Math.PI * 4.5;
		label.rotation.x = Math.PI * 4.5;

		return label;

	}

	public rotateRelay(angle : number){
		this.relayGroup.rotation.z= angle;
		this.letterMesh.rotation.y = -angle;
	}

	protected generateShieldGeometry(radius : number) : THREE.BufferGeometry
	{

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
		this.shieldEndTime = Date.now() + time + (time * this.level * 0.5);

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

		this.sparks.rotation.x += 0.1; //Math.random() * Math.PI * 3;

	}

	public hit(damage : number) : boolean
	{

		if(!this.shieldEnabled){

			this.relayHelpThrottler(() => {

				this.letterMesh.element.classList.add('relay-letter--red');

				setTimeout(() => this.letterMesh.element.classList.remove('relay-letter--red'), 100);

			})

			return super.hit(damage);
		}

		return false;

	}

	protected explosion() {
		super.explosion();

		this.relayGroup.remove(this.sparks);
		this.remove(this.letterMesh);

		let attack = new RelayDestoyAttack(
			this.position,
			200000
		);

		this.attacksContainer.addAttacks(attack);

	}

	fire(to: Vector3): void {}

}