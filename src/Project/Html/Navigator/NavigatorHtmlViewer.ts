import HtmlComponent from "../../Core/HtmlComponent";
import * as THREE from 'three';
import NavigatorTracker from "./NavigatorTracker";

export default class NavigatorHtmlViewer extends HtmlComponent
{

	public element : HTMLElement;

	protected trackers : NavigatorTracker[] = [];

	constructor() {
		super();

		this.element = this.createElement('<div class="navigator"></div>');
	}

	public addTrackers(...trackers : NavigatorTracker[]) : this
	{

		trackers.forEach(tracker => {
			this.trackers.push(tracker);
			this.element.appendChild(tracker.element);
		})

		return this;
	}

	public updateView() {
		this.trackers.forEach(tracker => tracker.updateView());
	}

}