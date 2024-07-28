import {Vector3} from 'three';
import Ship from "./Ship";
import AttacksContainer from "./../Containers/AttacksContainer";


export default abstract class WarShip extends Ship
{

	protected attacksContainer : AttacksContainer;

	constructor(speed : number = 0.1, attacksContainer : AttacksContainer) {

		super(speed);

		this.attacksContainer = attacksContainer;

	}

	public abstract fire(to : Vector3) : void;

}