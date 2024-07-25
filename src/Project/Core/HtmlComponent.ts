export default abstract class HtmlComponent
{

	protected createElement(html : string) : HTMLElement
	{

		let div = document.createElement('div');
		div.innerHTML = html;

		return <HTMLElement>div.children[0];

	}


}