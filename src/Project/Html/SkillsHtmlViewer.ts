import HtmlComponent from "../Core/HtmlComponent";
import Skill from "../Core/Skill";

class SkillsHtmlRow
{

	public element : HTMLElement;

	protected code : string;
	protected skill : Skill;

	constructor(code : string, skill : Skill) {

		let row = document.createElement('div');
		row.className = `skills__row skills__row--${code}`;
		row.innerHTML = `
			<i class="skills__row-cd"></i>
			<i class="skills__row-picture skills__row-picture--${code}"></i>
			<span class="skills__row-key">${skill.key}</span>
			<span class="skills__row-increment" style="display: ${(skill.maximumUses === Infinity) ? 'none' : 'block'}">(<span class="skills__row-increment-value"></span>/<span class="skills__row-increment-max"></span>)</span>
		`;

		this.element = row;
		this.skill = skill;
		this.code = code;

	}

	public updateView(){

		let cooldown = this.skill.getCooldownPercent();

		if(!this.skill.isAvailable()){
			cooldown = 0;
		}

		(<HTMLElement>this.element.querySelector('.skills__row-cd')).style.width = (cooldown * 100).toFixed(2) + '%';

		if(this.skill.maximumUses !== Infinity) {
			this.element.querySelector('.skills__row-increment-value')!.textContent = this.skill.availableUses.toString();
			this.element.querySelector('.skills__row-increment-max')!.textContent = this.skill.maximumUses.toString();
		}


	}

}

export default class SkillsHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected skillRows : SkillsHtmlRow[] = [];

	constructor() {

		super();

		this.element = this.createElement('<div class="skills"></div>');

	}

	public addSkill(code : string, skill : Skill) : this
	{

		let skillRow = new SkillsHtmlRow(code, skill);

		this.skillRows.push(skillRow);
		this.element.appendChild(skillRow.element);

		return this;

	}

	public updateView(){
		this.skillRows.forEach(skill => skill.updateView());
	}

}