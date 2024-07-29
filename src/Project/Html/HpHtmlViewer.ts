import HtmlComponent from "../Core/HtmlComponent";
import Healthy from "../Contracts/Healthy";
import {NormandyShip} from "../Components/Ships/Normandy/NormandyShip";

export default class HpHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected ship : NormandyShip;

	constructor(ship : NormandyShip) {

		super();

		this.ship = ship;

		this.element = this.createElement(`
			<div class="top"><div class="ship-hp"><div class="ship-hp__bar"></div><i class="ship-hp__level"></i></div></div>
		`)

	}

	public updateView(){

		(<HTMLElement>this.element.querySelector('.ship-hp__bar')).style.width = (this.ship.health / this.ship.maxHealth * 100).toFixed(2) + '%';
		(<HTMLElement>this.element.querySelector('.ship-hp__level')).textContent = 'Level ' + this.ship.healthLevel;
	}

}