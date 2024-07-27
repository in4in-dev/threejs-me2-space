import {Animation, AnimationThrottler} from "../../Three/Animation";

export default class Skill
{

	public key : string;
	public keyCode : string;
	public availableUses : number;
	public maximumUses : number;
	public cooldown : number;
	public level : number = 1;

	protected throttler : AnimationThrottler;

	protected isEnabled : boolean = true;
	protected isActive : boolean = false;

	constructor(key : string, keyCode : string, cooldown : number, maximumUses : number = Infinity) {

		this.key = key;
		this.keyCode = keyCode;
		this.cooldown = cooldown;
		this.availableUses = maximumUses;
		this.maximumUses = maximumUses;

		this.throttler = Animation.createThrottler(cooldown);

	}

	public getCooldownTime() : number
	{
		return this.throttler.getBeforeCall();
	}

	public getCooldownPercent() : number
	{
		return 1 - this.getCooldownTime() / this.throttler.getDelay();
	}

	public isReady(): boolean
	{
		return !this.getCooldownTime();
	}

	public isAvailable() : boolean
	{
		return this.isEnabled && this.availableUses > 0;
	}

	public toggle(b : boolean) : this
	{
		this.isEnabled = b;
		return this;
	}

	public on() : this
	{
		this.isEnabled = true;
		return this;
	}

	public off() : this
	{
		this.isEnabled = false;
		return this;
	}


	public upLevel() : this
	{
		this.level++;
		return this;
	}

	public setAvailableUses(x : number) : this
	{
		this.availableUses = Math.min(x, this.maximumUses);
		return this;
	}

	public setMaxUses(x : number) : this
	{
		this.maximumUses = x;
		return this;
	}

	public useIfNeed(fn : () => void){

		this.isActive && this.isEnabled && (this.availableUses > 0) && this.throttler(() => {

			if(this.availableUses !== Infinity){
				this.availableUses--;
			}

			fn();

		});

	}

	public initListeners(){

		window.addEventListener('keydown', (event) => {

			if (event.code === this.keyCode) {

				event.preventDefault();

				this.isActive = true;

			}

		});

		window.addEventListener('keyup', (event) => {

			if(event.code === this.keyCode){
				this.isActive = false;
			}

		});

	}

}