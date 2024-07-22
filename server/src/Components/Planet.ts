import SocketResponse from "../Core/SocketResponse";

export default class Planet implements SocketResponse
{
	public radius : number;
	public orbitRadius : number;
	public orbitAngle : number;
	public name : string;
	public texture : string;

	constructor(radius : number, orbitRadius : number, orbitAngle : number, name : string, texture : string) {
		this.radius = radius;
		this.orbitRadius = orbitRadius;
		this.name = name;
		this.orbitAngle = orbitAngle;
		this.texture = texture;
	}

	public toSocketJson(): any {
		return {
			radius : this.radius,
			orbitRadius : this.orbitRadius,
			orbitAngle : this.orbitAngle,
			name : this.name,
			texture : this.texture
		}
	}

}