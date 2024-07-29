export default abstract class HtmlComponent
{

	public abstract element : HTMLElement;

	protected createElement(html : string) : HTMLElement
	{

		let div = document.createElement('div');
		div.innerHTML = html;

		return <HTMLElement>div.children[0];

	}

	public abstract updateView() : void;


}