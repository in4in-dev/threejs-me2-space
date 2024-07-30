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

		this.find('.ship-hp')!.classList.toggle('ship-hp--danger', this.ship.health / this.ship.maxHealth <= 0.25);
		this.find('.ship-hp__bar')!.style.width = (this.ship.health / this.ship.maxHealth * 100).toFixed(2) + '%';
		this.find('.ship-hp__level')!.textContent = 'Level ' + this.ship.healthLevel;

	}

}