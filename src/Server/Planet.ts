export default class Planet
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
}