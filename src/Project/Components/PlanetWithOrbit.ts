import * as THREE from 'three';
import Orbit from "./Orbit";
import Planet from "./Planet";
import Component from "../Core/Component";

export default class PlanetWithOrbit extends Component
{

	public orbitRadius : number;
	public planetAngle : number;

	public orbit : Orbit;
	public planet : Planet;

	constructor(orbitRadius : number, planet : Planet, planetAngle : number) {

		super();

		this.orbitRadius = orbitRadius;
		this.planetAngle = planetAngle;

		this.planet = planet;
		this.orbit = this.createOrbit();

		this.setOrbitPosition(this.planetAngle);

		this.add(this.orbit);
		this.add(this.planet);

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

	protected createOrbit() : Orbit
	{
		return new Orbit(this.orbitRadius);
	}

}