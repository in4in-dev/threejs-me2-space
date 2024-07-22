import Component from "../Core/Component.ts";

export default class Enemy extends Component
{

	public health : number;

	constructor(health : number) {
		super();
		this.health = health;
	}



}