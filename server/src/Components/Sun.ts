import SocketResponse from "../Core/SocketResponse";

export default class Sun implements SocketResponse
{

	public radius : number;
	public glowColor : any;

	constructor(radius : number, glowColor : any) {
		this.radius = radius;
		this.glowColor = glowColor;
	}

	public toSocketJson(): any {
		return {
			radius : this.radius,
			glowColor : this.glowColor
		}
	}

}