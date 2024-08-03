import NavigatorTracker from "./NavigatorTracker";
import FriendRelay from "../../Components/Friends/FriendRelay";
import * as THREE from 'three';
import Ship from "../../Components/Ship";
import {Animation, AnimationThrottler} from "../../../Three/Animation";

export default class RelayNavigatorTracker extends NavigatorTracker
{

	public element : HTMLElement;

	protected relay : FriendRelay;
	protected lastHealth : number = 0;

	protected helpSignalThrottler : AnimationThrottler = Animation.createThrottler(300);

	constructor(relay : FriendRelay, ship : Ship, camera : THREE.Camera) {

		super(relay.getTrack(), camera, ship);

		this.relay = relay;
		this.lastHealth = relay.health;
		this.element = this.createElement(`<div class="navigator__item--relay navigator__item">${relay.letter}</div>`)

	}

	public updateView() {

		super.updateView();

		if(this.relay.health < this.lastHealth){

			this.helpSignalThrottler(() => {
				this.element.classList.add('navigator__item--relay-danger');
				setTimeout(() => this.element.classList.remove('navigator__item--relay-danger'), 100)
			})

		}

		this.lastHealth = this.relay.health;

	}

}