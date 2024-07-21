import SocketResponse from "../Core/SocketResponse";

export default class Border implements SocketResponse
{

	public radius : number;

	constructor(radius : number) {
		this.radius = radius;
	}

	public toSocketJson(): any {
		return {
			radius : this.radius
		}
	}

}