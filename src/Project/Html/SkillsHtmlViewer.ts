import HtmlComponent from "../Core/HtmlComponent";
import Skill from "../Core/Skill";
import Experienced from "../Contracts/Experienced";
import {Animation, AnimationLoop} from "../../Three/Animation";

class SkillsHtmlRow extends HtmlComponent
{

	public element : HTMLElement;

	protected ship : Experienced;
	protected code : string;
	protected key : string;
	protected keyCode : string;
	protected skill : Skill;

	protected canBeHold : boolean = false;

	protected interval : AnimationLoop | null = null;

	constructor(ship : Experienced, code : string, key : string, keyCode : string, canBeHold : boolean,  skill : Skill) {

		super();

		let row = document.createElement('div');
		row.className = `skills__row skills__row--${code}`;
		row.innerHTML = `
			<i class="skills__row-cd"></i>
			<i class="skills__row-picture skills__row-picture--${code}"></i>
			<span class="skills__row-key">${key}</span>
			<span class="skills__row-increment">(<span class="skills__row-increment-value"></span>/<span class="skills__row-increment-max"></span>)</span>
			<span class="skills__row-level">Level <span class="skills__row-level-value"></span></span>
			<button type="button" class="skills__row-upgrade"></button>
		`;

		this.ship = ship;
		this.element = row;
		this.key = key;
		this.keyCode = keyCode;
		this.skill = skill;
		this.code = code;
		this.canBeHold = canBeHold;

	}

	public initListeners(){

		this.find('.skills__row-upgrade')!.addEventListener('click', e => {

			e.stopPropagation();

			if(this.ship.spendExp(this.skill.getCostNextLevel())){
				this.skill.upLevel();
			}

		});

		window.addEventListener('keydown', (event) => {

			if (event.code === this.keyCode) {

				event.preventDefault();

				if(this.interval) {
					this.interval.stop();
				}

				if(this.skill.isCanBeUsedNow()){

					this.skill.useIfCan();

					if(this.canBeHold) {
						this.interval = Animation.loop(0, () => this.skill.useIfCan());
					}

				}

			}

		});

		window.addEventListener('keyup', (event) => {

			if (event.code === this.keyCode) {

				if(this.interval){
					this.interval.stop();
					this.interval = null;
				}

			}

		});

	}

	public updateView(){

		let cooldown = this.skill.getCooldownPercent();

		if(!this.skill.isEnabled() || !this.skill.isAvailable()){
			cooldown = 0;
		}

		this.find('.skills__row-cd')!.style.width = (cooldown * 100).toFixed(2) + '%';

		if(this.skill.getMaximumUses() !== Infinity) {
			this.find('.skills__row-increment')!.style.display = 'block';
			this.find('.skills__row-increment-value')!.textContent = this.skill.getAvailableUses().toString();
			this.find('.skills__row-increment-max')!.textContent = this.skill.getMaximumUses().toString();
		}else{
			this.find('.skills__row-increment')!.style.display = 'none';
		}

		this.find('.skills__row-upgrade')!.classList.toggle('skills__row-upgrade--disabled', this.ship.experience < this.skill.getCostNextLevel());

		this.find('.skills__row-upgrade')!.textContent = this.skill.getCostNextLevel().toString();
		this.find('.skills__row-level-value')!.textContent = this.skill.level.toString();
		this.find('.skills__row-upgrade')!.style.display = this.skill.getCostNextLevel() === Infinity ? 'none' : 'flex';


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

	public addSkill(code : string, key : string, keyCode : string, canBeHold : boolean, skill : Skill) : this
	{

		let skillRow = new SkillsHtmlRow(this.ship, code, key, keyCode, canBeHold, skill);

		this.skillRows.push(skillRow);
		this.element.appendChild(skillRow.element);

		return this;

	}

	public updateView(){
		this.skillRows.forEach(skill => skill.updateView());
	}

	public initListeners(){
		this.skillRows.forEach(skill => skill.initListeners());
	}

}