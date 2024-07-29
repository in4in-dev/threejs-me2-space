import Mob from "../Mob";
import * as THREE from "three";
import AttacksContainer from "../../Containers/AttacksContainer";
import ModelLoader from "../../../Three/ModelLoader";
//@ts-ignore
import {CSS3DObject} from "three/examples/jsm/renderers/CSS3DRenderer";
import {Animation, AnimationThrottler} from "../../../Three/Animation";
import Sparks from "../Sparks";
import RelayDestroyAttack from "../Attacks/RelayDestroyAttack";
import Random from "../../../Three/Random";
import GeometryGenerator from "../../../Three/GeometryGenerator";

export default class FriendRelay extends Mob
{

	public level : number;
	public letter : string;

	protected group : THREE.Group;
	protected mesh : THREE.Group;
	protected track : THREE.Mesh;
	protected icon : CSS3DObject;
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
		super(7000,0.00001, bulletsContainer);

		this.level = level;
		this.letter = letter;

		this.group = new THREE.Group;

		this.mesh = this.createBody();
		this.shield = this.createShield();
		this.icon = this.createLetter();
		this.sparks = this.createSparks();
		this.glow = this.createGlow();
		this.track = this.createTrack();

		this.group.add(this.shield, this.mesh, this.sparks, this.glow);

		this.add(this.icon, this.group, this.track);

	}

	private createTrack() : THREE.Mesh
	{

		let mesh = new THREE.Mesh(
			new THREE.CircleGeometry(0.2, 1, 1),
			new THREE.MeshBasicMaterial({transparent : true, opacity : 0})
		);

		mesh.position.z = 6;

		return mesh;

	}

	private createGlow() : THREE.Sprite
	{

		let textures = [
			'../../../../assets/light.png',
			'../../../../assets/glow.png'
		];

		let glowSprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: new THREE.TextureLoader().load(Random.arr(textures)),
				color: '#2289c4',
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite:false,
				opacity: Random.float(0.4, 0.8)
			})
		);

		glowSprite.scale.set(12, Random.int(6, 12), 12);

		return glowSprite;
	}

	private createSparks() : Sparks
	{
		let sparks = new Sparks(0.2, '#04334f', 0.4);

		sparks.position.y = -0.5;

		return sparks;
	}

	private createLetter() : CSS3DObject
	{

		let wrap = document.createElement('div');
		wrap.className = 'relay-letter';
		wrap.textContent = this.letter;

		let label = new CSS3DObject(wrap);
		label.position.set(-10, -9, 7);

		label.scale.set(0.05, 0.05, 0.05);
		label.rotation.set(Math.PI * 4.5, Math.PI * 4.5, 0);

		return label;

	}

	private generateShieldGeometry(radius : number) : THREE.BufferGeometry
	{
		return GeometryGenerator.emptySphere(radius, 3000);
	}

	private createShield() : THREE.Points
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
				map : particleTexture,
				opacity : 0
			})
		);
	}

	private createBody() : THREE.Group
	{

		let mesh = new ModelLoader(
			'../../../../assets/mobs/relay/relay.obj',
			'../../../../assets/mobs/relay/relay.mtl',
		).loadInBackground();

		mesh.rotation.x = 1.5;
		mesh.scale.set(4.5, 4.5, 4.5);

		return mesh;

	}

	private indicateHit(){

		this.relayHelpThrottler(() => {

			this.icon.element.classList.add('relay-letter--red');

			setTimeout(() => this.icon.element.classList.remove('relay-letter--red'), 100);

		});

	}

	public upLevel() : void
	{

		let proportion = this.health / this.maxHealth;

		this.level++;
		this.maxHealth = 7000 * this.level;
		this.health = proportion * this.maxHealth;

	}

	public getTrack() : THREE.Mesh
	{
		return this.track
	}

	public rotateRelay(angle : number) : void
	{
		this.group.rotation.z= angle;
		this.icon.rotation.y = -angle;
	}

	public activateShield(time : number){

		this.shieldEnabled = true;
		this.shieldStartTime = Date.now();
		this.shieldEndTime = Date.now() + time;

	}

	public deactivateShield(){
		this.shieldEnabled = false;
	}

	public animate(){

		let now = Date.now();

		if(now > this.shieldEndTime){
			this.shieldEnabled = false;
		}

		if(this.shieldEnabled){

			(<THREE.PointsMaterial>this.shield.material).opacity = 1;

			//Анимируем щит
			let shieldDuration = (this.shieldEndTime - this.shieldStartTime),
				progress = (now - this.shieldStartTime) / shieldDuration,
				explosionDuration = 500 / shieldDuration,
				explosionProgress = progress < explosionDuration
					? (progress / explosionDuration)
					: progress > (1 - explosionDuration)
						? ((1 - progress) / explosionDuration)
						: 1;

			this.shield.geometry.copy(
				this.generateShieldGeometry(explosionProgress * this.shieldMaxRadius)
			);

		}else{
			(<THREE.PointsMaterial>this.shield.material).opacity = 0;
		}

		this.sparks.rotation.x += 0.1;

	}

	public hit(damage : number) : boolean
	{

		if(!this.shieldEnabled){

			this.indicateHit();

			return super.hit(damage);

		}

		return false;

	}

	protected explosion() {

		super.explosion();

		this.group.remove(this.sparks);

		this.remove(this.icon);

		this.attacksContainer.addAttacks(
			new RelayDestroyAttack(
				this.position,
				200000
			)
		);

	}

	public fire(): void
	{

	}

}