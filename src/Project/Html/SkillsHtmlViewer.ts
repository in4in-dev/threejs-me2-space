import HtmlComponent from "../Core/HtmlComponent";

class Skill
{

	public element : HTMLElement;

	protected cooldown : number = 0;
	protected counterCurrent : number = 0;
	protected counterMax : number = 0;

	constructor(code : string, key : string, showCounter : boolean = false) {

		let row = document.createElement('div');
		row.className = `skills__row skills__row--${code}`;
		row.innerHTML = `
			<i class="skills__row-cd"></i>
			<i class="skills__row-picture skills__row-picture--${code}"></i>
			<span class="skills__row-key">${key}</span>
			<span class="skills__row-increment" style="display: ${showCounter ? 'block' : 'none'}">(<span class="skills__row-increment-value"></span>/<span class="skills__row-increment-max"></span>)</span>
		`;

		this.element = row;

	}

	public setCooldown(x : number) : this
	{
		this.cooldown = x;

		(<HTMLElement>this.element.querySelector('.skills__row-cd')).style.width = (x * 100).toFixed(2) + '%';

		return this;
	}

	public setCounterValue(current : number) : this
	{
		this.counterCurrent = current;

		this.element.querySelector('.skills__row-increment-value')!.textContent = current.toString()

		return this;
	}

	public setCounterMax(max : number) : this
	{
		this.counterMax = max;

		this.element.querySelector('.skills__row-increment-max')!.textContent = max.toString();

		return this;
	}

}

export default class SkillsHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	public fireSkill : Skill;
	public waveSkill : Skill;
	public rocketSkill : Skill;
	public friendSkill : Skill;

	constructor() {

		super();

		let div = document.createElement('div')
		div.className = 'skills';

		this.element = div;

		this.fireSkill = this.addSkill('fire', 'SPACE');
		this.waveSkill = this.addSkill('wave', 'J');
		this.rocketSkill = this.addSkill('rocket', 'K');
		this.friendSkill = this.addSkill('friend', 'H', true);

	}

	public addSkill(code : string, name : string, showCounter : boolean = false) : Skill
	{

		let skill = new Skill(code, name, showCounter);

		this.element.appendChild(skill.element);

		return skill;

	}

}