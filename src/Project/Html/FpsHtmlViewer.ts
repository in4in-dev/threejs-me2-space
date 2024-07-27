import HtmlComponent from "../Core/HtmlComponent";

export default class FpsHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected fps : number = 0;

	constructor() {

		super();

		this.element = this.createElement('<div class="fps"></div>');

	}

	public setValue(fps : number){

		this.fps = fps;
		this.element.textContent = fps.toString();

	}


}