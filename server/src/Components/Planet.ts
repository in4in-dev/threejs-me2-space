import SocketResponse from "../Core/SocketResponse";

export default class Planet implements SocketResponse
{
	public radius : number;
	public orbitRadius : number;
	public name : string;
	public texture : string;

	constructor(radius : number, orbitRadius : number, name : string, texture : string) {
		this.radius = radius;
		this.orbitRadius = orbitRadius;
		this.name = name;
		this.texture = texture;
	}

	public toSocketJson(): any {
		return {
			radius : this.radius,
			orbitRadius : this.orbitRadius,
			name : this.name,
			texture : this.texture
		}
	}

}