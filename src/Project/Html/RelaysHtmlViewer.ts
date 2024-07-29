import HtmlComponent from "../Core/HtmlComponent";
import FriendRelay from "../Components/Friends/FriendRelay";
import MobsContainer from "../Containers/MobsContainer";
import {Animation, AnimationThrottler} from "../../Three/Animation";

class RelayHtmlViewer extends HtmlComponent
{

	protected relay : FriendRelay;
	protected lastHealth : number;

	public element : HTMLElement;

	protected helpSignalThrottler : AnimationThrottler = Animation.createThrottler(200);

	constructor(relay : FriendRelay) {
		super();

		this.relay = relay;
		this.lastHealth = relay.health;
		this.element = this.createElement(`<div class="relays__item">
				<i class="relays__item-letter">${relay.letter}</i>
				<div class="relays__item-health">
					<div class="relays__item-health-bar"></div>
				</div>
		</div>"`)
	}

	public updateView(){

		let bar = (<HTMLElement>this.element.querySelector('.relays__item-health-bar')),
			letter = (<HTMLElement>this.element.querySelector('.relays__item-letter')),
			percent = this.relay.health / this.relay.maxHealth;

		bar.style.width = (percent * 100).toFixed(2) + '%';

		if(percent > 0.5){
			bar.className = 'relays__item-health-bar relays__item-health-bar--green';
		}else{
			bar.className = 'relays__item-health-bar relays__item-health-bar--red';
		}

		if(this.lastHealth !== this.relay.health){
			this.helpSignalThrottler(() => {
				letter.classList.add('relays__item-letter--red');
				setTimeout(() => letter.classList.remove('relays__item-letter--red'), 100)
			})
		}

		this.lastHealth = this.relay.health;

	}

}

export default class RelaysHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected childrens : RelayHtmlViewer[] = [];

	constructor() {

		super();

		this.element = this.createElement('<div class="relays"></div>');

	}

	public addRelays(...relays : FriendRelay[]) : this
	{

		relays.forEach(relay => {

			let view = new RelayHtmlViewer(relay);

			this.element.appendChild(view.element);
			this.childrens.push(view);

		});

		return this;

	}


	public updateView(){

		this.childrens.forEach(child => child.updateView());

	}


}