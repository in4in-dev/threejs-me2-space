import Planet from "./Planet";
import AsteroidBelt from "./AsteroidBelt";
import Sun from "./Sun";
import Border from "./Border";
import SocketResponse from "../Core/SocketResponse";
import Random from "../Core/Random";


export default class University implements SocketResponse
{

	protected planets : Planet[] = [];
	protected asteroidBelt : AsteroidBelt;
	protected sun : Sun;
	protected border : Border;

	constructor() {

		let glows = [ '#fed36a', 'blue', 'pink', '#a63737', '#d0652c'];

		this.sun = new Sun(
			Random.float(0.4, 4),
			glows[Random.int(0, glows.length)]
		);

		let beltRadius = Random.int(6, 20);

		this.asteroidBelt = new AsteroidBelt(
			beltRadius
		);

		/////////////////////
		// Создание нескольких планет и орбит
		let planetNames = ["Сухов Владислав", 'Жопа полная', "Сюда не лети", "Очко", "Рай", "Гуся", "Курилы", "Больница"];
		let planetTextures = ["assets/planets/1.png", "assets/planets/2.png", "assets/planets/3.png", "assets/planets/4.png", "assets/planets/5.png", "assets/planets/6.png", "assets/planets/7.png", "assets/planets/8.png"];

		for(let i = 0, planetRadius = 0, planetsCount =  Random.int(4, 8); i < planetsCount; i++){

			planetRadius += Random.int(5, 10);

			this.planets.push(
				new Planet(
					Random.float(0.2, 1.5),
					planetRadius,
					planetNames[i],
					planetTextures[i]
				)
			);

		}

		this.border = new Border(80);


	}

	public toSocketJson(): any {

		return {
			planets : this.planets.map(planet => planet.toSocketJson()),
			asteroidBelt : this.asteroidBelt.toSocketJson(),
			sun : this.sun.toSocketJson(),
			border : this.border.toSocketJson()
		}

	}

}