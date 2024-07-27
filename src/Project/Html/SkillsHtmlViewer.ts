import HtmlComponent from "../Core/HtmlComponent";
import Skill from "../Core/Skill";
import Experienced from "../Contracts/Experienced";

class SkillsHtmlRow
{

	public element : HTMLElement;

	protected code : string;
	protected skill : Skill;
	protected cost : () => number;
	protected onUpgrade : () => void;

	constructor(code : string, cost : () => number, skill : Skill, onUpgrade : () => void) {

		let row = document.createElement('div');
		row.className = `skills__row skills__row--${code}`;
		row.innerHTML = `
			<i class="skills__row-cd"></i>
			<i class="skills__row-picture skills__row-picture--${code}"></i>
			<span class="skills__row-key">${skill.key}</span>
			<span class="skills__row-increment" style="display: ${(skill.maximumUses === Infinity) ? 'none' : 'block'}">(<span class="skills__row-increment-value"></span>/<span class="skills__row-increment-max"></span>)</span>
			<span class="skills__row-level">Level <span class="skills__row-level-value">${skill.level}</span></span>
			<button type="button" class="skills__row-upgrade">${cost()}</button>
		`;

		this.element = row;
		this.onUpgrade = onUpgrade;
		this.skill = skill;
		this.cost = cost;
		this.code = code;

		this.initListeners();

	}

	protected initListeners(){
		this.element.querySelector('.skills__row-upgrade')!.addEventListener('click', e => {
			e.stopPropagation();
			this.onUpgrade();
		});
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

		this.element.querySelector('.skills__row-upgrade')!.textContent = this.cost().toString();
		this.element.querySelector('.skills__row-level-value')!.textContent = this.skill.level.toString();


	}

}

export default class SkillsHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected ship : Experienced;
	protected skillRows : SkillsHtmlRow[] = [];

	constructor(ship : Experienced) {

		super();

		this.ship = ship;
		this.element = this.createElement('<div class="skills"></div>');

	}

	public addSkill(code : string, skill : Skill, cost : () => number, onUpgrade : () => void) : this
	{

		let skillRow = new SkillsHtmlRow(code, cost, skill, () => {

			if(this.ship.spendExp(cost())){
				skill.upLevel();
				onUpgrade();
			}

		});

		this.skillRows.push(skillRow);
		this.element.appendChild(skillRow.element);

		return this;

	}

	public updateView(){
		this.skillRows.forEach(skill => skill.updateView());
	}

}