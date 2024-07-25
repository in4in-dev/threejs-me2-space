import HtmlComponent from "../Core/HtmlComponent";

export default class HpHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected health : number;
	protected maxHealth : number;

	constructor(initHealth : number, maxHealth : number) {

		super();

		this.health = initHealth;
		this.maxHealth = maxHealth;

		this.element = this.createElement(`
			<div class="ship-hp"><div class="ship-hp__bar"></div></div>
		`)

		this.updateView();

	}

	protected updateView(){

		(<HTMLElement>this.element.querySelector('.ship-hp__bar')).style.width = (this.health / this.maxHealth * 100).toFixed(2) + '%';

	}

	public setHealth(health : number){

		this.health = health;

		this.updateView();

	}


}