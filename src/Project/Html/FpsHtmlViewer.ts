import HtmlComponent from "../Core/HtmlComponent";

export default class FpsHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected fps : number = 0;
	protected fpsRender : number = 0;

	constructor() {

		super();

		this.element = this.createElement('<div class="fps"></div>');

	}

	protected prepare(x : number, length : number) : string
	{

		let r = x.toString();

		for(let i = 0; i < length - x.toString().length; i++){
			r = '0' + r;
		}

		return r;

	}

	public setValue(fps : number, fpsRender : number){

		this.fps = fps;
		this.fpsRender = fpsRender;
		this.element.textContent = `${this.prepare(fps, 5)} (Render: ${this.prepare(fpsRender, 5)})`;

	}


}