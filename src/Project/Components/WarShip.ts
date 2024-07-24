import * as THREE from 'three';
import Ship from "./Ship";
import Bullet from "./Bullet";
import BulletsContainer from "./BulletsContainer";
import Random from "../../Three/Random";


export default class WarShip extends Ship
{

	public bullets : Bullet[] = [];
	public bulletsGroup : BulletsContainer;

	protected bulletColor : any = '#ffffff';
	protected bulletGlowColor : any = '#1c80ff';

	constructor(x : number = 10, y : number = 10, speed : number = 0.1, bulletGroup : BulletsContainer) {
		super(x, y, speed);
		this.bulletsGroup = bulletGroup;
	}

	public fire(){

		let to = new THREE.Vector3(0, -1, 0).applyQuaternion(this.quaternion).normalize();

		let bullet1 = new Bullet(
			this.position.x + 0.3,
			this.position.y - 0.3,
			to.x,
			to.y,
			Random.int(1, 5),
			this.bulletColor,
			this.bulletGlowColor
		);

		let bullet2 = new Bullet(
			this.position.x - 0.3,
			this.position.y - 0.3,
			to.x,
			to.y,
			Random.int(1, 5),
			this.bulletColor,
			this.bulletGlowColor
		);

		this.bulletsGroup.addBullets(bullet1, bullet2)

	}

	public clearBullets(){

		this.bullets = this.bullets.filter(bullet => {

			if(!bullet.isVisible){
				this.bulletsGroup.remove(bullet.mesh!);
				return false;
			}

			return true;

		});

	}

}