import HtmlComponent from "../../Core/HtmlComponent";
import * as THREE from 'three';
import NavigatorTracker from "./NavigatorTracker";
import Ship from "../../Components/Ship";

export default class NavigatorHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected camera : THREE.Camera;
	protected ship : Ship;
	protected trackers : NavigatorTracker[] = [];

	constructor(camera : THREE.Camera, ship : Ship) {
		super();

		this.ship = ship;
		this.camera = camera;
		this.element = this.createElement('<div class="navigator"></div>');
	}

	public addTrackers(...trackers : NavigatorTracker[]) : this
	{

		trackers.forEach(tracker => {

			tracker.setShip(this.ship).setCamera(this.camera);

			this.trackers.push(tracker);
			this.element.appendChild(tracker.element);

		})

		return this;
	}

	public updateView() {
		this.trackers.forEach(tracker => tracker.updateView());
	}

}