import HtmlComponent from "../Core/HtmlComponent";

export default class ExpHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected experience : number;

	constructor(initExperience : number) {

		super();

		this.experience = initExperience;

		this.element = this.createElement(`
			<div class="ship-exp"><i class="ship-exp__icon"></i><span class="ship-exp__value"></span></div>
		`)

		this.updateView();

	}

	protected updateView(){

		(<HTMLElement>this.element.querySelector('.ship-exp__value')).textContent = this.experience.toString();

	}

	public setValue(experience : number){

		this.experience = experience;

		this.updateView();

	}


}