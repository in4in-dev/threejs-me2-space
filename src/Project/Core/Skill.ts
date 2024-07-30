interface SkillLevelUpCallback{
	() : void
}

interface SkillUseCallback{
	() : void
}

interface SkillNumberGetter{
	() : number
}

interface SkillBooleanGetter{
	() : boolean
}

export default class Skill
{



	public level : number = 1;
	public costs : number[];

	protected lastActivity : number = 0;

	protected cooldown : number | SkillNumberGetter;
	protected enabled : boolean | SkillBooleanGetter = true;
	protected availableUses : number | SkillNumberGetter;
	protected maximumUses : number | SkillNumberGetter;

	protected onUse : SkillUseCallback | null = null;
	protected onLevelUp : SkillLevelUpCallback | null = null;

	constructor(
		cooldown : number = 0,
		costs : number[] = [],
		maximumUses : number = Infinity
	) {

		this.costs = costs;
		this.cooldown = cooldown;
		this.availableUses = maximumUses;
		this.maximumUses = maximumUses;

	}

	public getCostNextLevel() : number
	{

		if(!this.costs.length){
			return Infinity;
		}

		if(this.costs.length >= this.level){
			return this.costs[this.level - 1];
		}

		return this.costs[this.costs.length - 1];

	}

	public getCooldown() : number
	{
		return this.cooldown instanceof Function ? this.cooldown() : this.cooldown;
	}

	public getCooldownTime() : number
	{
		return Math.max(0, this.lastActivity + this.getCooldown() - Date.now());
	}

	public getCooldownPercent() : number
	{
		return 1 - this.getCooldownTime() / this.getCooldown();
	}

	public getAvailableUses() : number
	{
		return this.availableUses instanceof Function ? this.availableUses() : this.availableUses;
	}

	public getMaximumUses() : number
	{
		return this.maximumUses instanceof Function ? this.maximumUses() : this.maximumUses;
	}

	public isReady(): boolean
	{
		return !this.getCooldownTime();
	}

	public isEnabled() : boolean
	{
		return this.enabled instanceof Function ? this.enabled() : this.enabled;
	}

	public isAvailable() : boolean
	{
		return this.getAvailableUses() > 0;
	}

	public isCanBeUsedNow() : boolean
	{
		return this.isReady() && this.isAvailable() && this.isEnabled();
	}

	public setEnabled(b : boolean | SkillBooleanGetter) : this
	{
		this.enabled = b;
		return this;
	}

	public upLevel() : this
	{

		this.level++;

		this.onLevelUp && this.onLevelUp();

		return this;

	}

	public setAvailableUses(x : number | SkillNumberGetter) : this
	{
		this.availableUses = x;
		return this;
	}

	public setMaxUses(x : number | SkillNumberGetter) : this
	{
		this.maximumUses = x;
		return this;
	}

	public setCosts(costs : number[]) : this
	{
		this.costs = costs;
		return this;
	}

	public setCooldown(cd : number | SkillNumberGetter) : this
	{
		this.cooldown = cd;
		return this;
	}

	public setOnLevelUp(cb : SkillLevelUpCallback | null) : this
	{
		this.onLevelUp = cb;
		return this;
	}

	public setOnUse(cb : SkillUseCallback | null) : this
	{
		this.onUse = cb;
		return this;
	}

	public useIfCan(){

		if(this.isCanBeUsedNow()){
			this.use();
		}

	}

	public use(){
		this.lastActivity = Date.now();
		this.onUse && this.onUse();
	}


}