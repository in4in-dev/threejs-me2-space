import * as THREE from "three";
import Sun from "../../Components/Sun";
import Planet from "../../Components/Planet";
import Background from "../../Components/Background.ts";
import AsteroidBelt from "../../Components/AsteroidBelt.ts";
import Border from "../../Components/Border.ts";
import Game from "../Game.ts";

export default class SinglePlayerGame extends Game
{

	constructor() {

		/**
		 * Генерация фона
		 */
		let background = new Background('../../assets/space_texture.jpg');

		/**
		 * Генерация солнца
		 */
		let glows = [ '#fed36a', 'blue', 'pink', '#a63737', '#d0652c'];
		let sun = new Sun(
			THREE.MathUtils.randFloat(0.4, 4),
			500,
			'white',
			glows[THREE.MathUtils.randInt(0, glows.length)]
		);

		/**
		 * Генерация пояса астероидов
		 */
		let asteroidBelt = new AsteroidBelt(
			THREE.MathUtils.randInt(6, 20)
		);


		/**
		 * Генерация планет
		 */
		let planets = [];

		let planetNames = [
			"Меркурий",
			'Венера',
			"Земля",
			"Марс",
			"Юпитер",
			"Сатурн",
			"Уран",
			"Нептун"
		];

		let planetTextures = [
			"assets/planets/1.png",
			"assets/planets/2.png",
			"assets/planets/3.png",
			"assets/planets/4.png",
			"assets/planets/5.png",
			"assets/planets/6.png",
			"assets/planets/7.png",
			"assets/planets/8.png"
		];

		let planetsCount = THREE.MathUtils.randInt(4, 8);

		for(let i = 0, orbitRadius = 0; i < planetsCount; i++){

			orbitRadius += THREE.MathUtils.randInt(5, 10);

			planets.push(
				new Planet(
					THREE.MathUtils.randFloat(0.2, 1.5),
					orbitRadius,
					Math.random() * 2 * Math.PI,
					planetNames[i],
					planetTextures[i],
					THREE.MathUtils.randInt(0, 3),
					!THREE.MathUtils.randInt(0, 3)
				)
			);

		}

		/**
		 * Генерация границы
		 */
		let border = new Border(80, '#549b24', 0.3);

		super(
			background,
			sun,
			asteroidBelt,
			planets,
			border
		);

	}

}