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
	protected isKeyHold : boolean = false;
	protected isKeyPressed : boolean = false;

	protected canBeHold : boolean = true;

	constructor(key : string, keyCode : string, cooldown : number, canBeHold : boolean = false, maximumUses : number = Infinity) {

		this.key = key;
		this.keyCode = keyCode;
		this.cooldown = cooldown;
		this.availableUses = maximumUses;
		this.maximumUses = maximumUses;
		this.canBeHold = canBeHold;

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

		(this.isKeyHold || this.isKeyPressed) && this.isAvailable() && this.throttler(() => {

			if(this.availableUses !== Infinity){
				this.availableUses--;
			}

			fn();

		});

		this.isKeyPressed = false;

	}

	public initListeners(){

		if(this.canBeHold) {

			window.addEventListener('keydown', (event) => {

				if (event.code === this.keyCode) {

					event.preventDefault();

					this.isKeyHold = this.isAvailable();

				}

			});

			window.addEventListener('keyup', (event) => {

				if (event.code === this.keyCode) {
					this.isKeyHold = false;
				}

			});

		}else{

			window.addEventListener('keypress', (event) => {

				if (event.code === this.keyCode) {

					event.preventDefault();

					this.isKeyPressed = this.isAvailable();

				}

			});

		}

	}

}