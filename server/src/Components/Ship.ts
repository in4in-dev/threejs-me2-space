import SocketResponse from "../Core/SocketResponse";

export default class Ship implements SocketResponse
{

	public x : number;
	public y : number;

	public rotate : number;

	constructor(x : number, y : number, z : number, rotate : number) {
		this.x = x;
		this.y = y;
		this.rotate = rotate;
	}

	public moveTo(x : number, y : number){
		this.x = x;
		this.y = y;
	}

	public rotation(angle : number)
	{
		this.rotate = angle;
	}

	public toSocketJson(): any {
		return {
			x : this.x,
			y : this.y,
			rotate : this.rotate
		}
	}

}