import * as THREE from 'three';
import Ship from "./Ship";
import AttacksContainer from "./AttacksContainer";
import Random from "../../Three/Random";
import {Vector3} from "three";


export default abstract class WarShip extends Ship
{

	protected attacksContainer : AttacksContainer;

	constructor(x : number = 10, y : number = 10, speed : number = 0.1, attacksContainer : AttacksContainer) {

		super(x, y, speed);

		this.attacksContainer = attacksContainer;

	}

	public abstract fire(to : Vector3) : void;

}