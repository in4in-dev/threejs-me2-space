import HtmlComponent from "../Core/HtmlComponent";
import Healthy from "../Contracts/Healthy";

export default class HpHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected ship : Healthy;

	constructor(ship : Healthy) {

		super();

		this.ship = ship;

		this.element = this.createElement(`
			<div class="ship-hp"><div class="ship-hp__bar"></div></div>
		`)

	}

	public updateView(){

		(<HTMLElement>this.element.querySelector('.ship-hp__bar')).style.width = (this.ship.health / this.ship.maxHealth * 100).toFixed(2) + '%';

	}

}