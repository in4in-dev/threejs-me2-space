import HtmlComponent from "../Core/HtmlComponent";
import Experienced from "../Contracts/Experienced";

export default class ExpHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected ship : Experienced;

	constructor(ship : Experienced) {

		super();

		this.ship = ship;

		this.element = this.createElement(`
			<div class="ship-exp"><i class="ship-exp__icon"></i><span class="ship-exp__value"></span><span class="ship-exp__profit"></span></div>
		`)

	}

	public updateView(){

		this.find('.ship-exp__value')!.textContent = this.ship.experience.toString();

	}


}