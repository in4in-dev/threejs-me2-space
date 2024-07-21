import Ship from "./Ship.ts";
import Planet from "./Planet.ts";
import AsteroidBelt from "./AsteroidBelt.ts";
import Belt from "./Belt.ts";
import Sun from "./Sun.ts";
import * as THREE from "three";
import Border from "./Border.ts";

export default class University
{

	protected ships : Ship[] = [];

	protected planets : Planet[] = [];
	protected asteroidBelt : AsteroidBelt;
	protected belt : Belt;
	protected sun : Sun;
	protected border : Border;

	constructor() {

		let glows = [ '#fed36a', 'blue', 'pink', '#a63737', '#d0652c'];

		this.sun = new Sun(
			THREE.MathUtils.randFloat(0.4, 4),
			glows[THREE.MathUtils.randInt(0, glows.length)]
		);

		let beltRadius = THREE.MathUtils.randInt(6, 20);

		this.belt = new Belt(
			beltRadius,
			THREE.MathUtils.randFloat(0.4, 3)
		);

		this.asteroidBelt = new AsteroidBelt(
			beltRadius
		);

		/////////////////////
		// Создание нескольких планет и орбит
		let planetNames = ["Сухов Владислав", 'Жопа полная', "Сюда не лети", "Очко", "Рай", "Гуся", "Курилы", "Больница"];
		let planetTextures = ["assets/planets/1.png", "assets/planets/2.png", "assets/planets/3.png", "assets/planets/4.png", "assets/planets/5.png", "assets/planets/6.png", "assets/planets/7.png", "assets/planets/8.png"];

		for(let i = 0, planetRadius = 0, planetsCount =  THREE.MathUtils.randInt(4, 8); i < planetsCount; i++){

			planetRadius += THREE.MathUtils.randInt(5, 10);

			this.planets.push(
				new Planet(
					THREE.MathUtils.randFloat(0.2, 1.5),
					planetRadius,
					planetNames[i],
					planetTextures[i]
				)
			);

		}

		this.border = new Border(80);


	}

}