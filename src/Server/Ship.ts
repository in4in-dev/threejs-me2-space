export default class Ship
{

	public x : number;
	public y : number;
	public z : number;

	public rotate : number;

	constructor(x : number, y : number, z : number, rotate : number) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.rotate = rotate;
	}

}