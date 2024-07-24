import * as THREE from 'three';
import Orbit from "./Orbit";
import Planet from "./Planet";
import Component from "../Core/Component";

export default class PlanetWithOrbit extends Component
{

	public orbitRadius : number;
	public planetAngle : number;

	public orbit : Orbit | null = null;
	public planet : Planet;

	constructor(orbitRadius : number, planet : Planet, planetAngle : number) {

		super();

		this.orbitRadius = orbitRadius;
		this.planetAngle = planetAngle;

		this.planet = planet;

	}

	public async load() : Promise<this>
	{

		await this.planet.load();

		this.setOrbitPosition(this.planetAngle);

		this.orbit = await this.createOrbit();

		this.add(this.orbit);
		this.add(this.planet);

		return this;
	}

	public setOrbitPosition(angle : number)
	{

		this.planetAngle = angle;

		//Ставим позицию планете
		this.planet.position.set(
			this.orbitRadius * Math.cos(this.planetAngle),
			this.orbitRadius * Math.sin(this.planetAngle),
			0
		);

	}

	protected async createOrbit() : Promise<Orbit>
	{
		return await new Orbit(this.orbitRadius).load();
	}

}