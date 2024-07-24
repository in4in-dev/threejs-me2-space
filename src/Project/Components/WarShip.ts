import * as THREE from 'three';
import Ship from "./Ship";
import AttacksContainer from "./AttacksContainer";
import Random from "../../Three/Random";
import {Vector3} from "three";


export default abstract class WarShip extends Ship
{

	protected bulletsGroup : AttacksContainer;

	constructor(x : number = 10, y : number = 10, speed : number = 0.1, bulletGroup : AttacksContainer) {

		super(x, y, speed);

		this.bulletsGroup = bulletGroup;

	}

	public abstract fire(to : Vector3) : void;
	public abstract altFire(to : Vector3) : void;

}