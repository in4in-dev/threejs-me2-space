import Engine from "./Engine";
import * as THREE from "three";
import Sun from "../Components/Sun";
import Background from "../Components/Background";
import Orbit from "../Components/Orbit";
import AsteroidBelt from "../Components/AsteroidBelt";
import Border from "../Components/Border";
import {Vector3} from "three";
import Enemy from "../Components/Enemy";
import EnemyReaper from "../Components/Enemies/EnemyReaper";
import {NormandyShip} from "../Components/Ships/Normandy/NormandyShip";
import AttacksContainer from "../Components/AttacksContainer";
import PlanetWithOrbit from "../Components/PlanetWithOrbit";
import Random from "../../Three/Random";
import Animation from "../../Three/Animation";

export default class Game extends Engine
{

	protected shipMovingAllow : boolean = true;
	protected shipMovingActive : boolean = false;

	protected shipFireAllow : boolean = true;
	protected shipFireActive : boolean = false;
	protected shipFireThrottler : Function = Animation.createThrottler(100);

	protected shipAltFireAllow : boolean = true;
	protected shipAltFireActive : boolean = false;
	protected shipAltFireThrottler : Function = Animation.createThrottler(2000);

	protected mousePositionX : number = 0;
	protected mousePositionY : number = 0;

	protected enemyMaxCount : number = 3;
	protected enemySpawnThrottler : Function = Animation.createThrottler(5000);

	protected showAxis : boolean = false;

	protected background : Background;
	protected ship : NormandyShip;
	protected sun : Sun;
	protected border : Border;
	protected asteroidBelt : AsteroidBelt;
	protected planets : PlanetWithOrbit[] = [];
	protected enemies : Enemy[] = [];

	protected enemiesBullets : AttacksContainer;
	protected friendsBullets : AttacksContainer;

	constructor(
		background : Background,
		sun : Sun,
		asteroidBelt : AsteroidBelt,
		planets : PlanetWithOrbit[],
		border : Border
	) {
		super(document.body);

		this.background = background;
		this.sun = sun;
		this.asteroidBelt = asteroidBelt;
		this.planets = planets;
		this.border = border;

		this.enemiesBullets = new AttacksContainer;
		this.friendsBullets = new AttacksContainer;

		this.ship = new NormandyShip(10, 10, 0.3, this.friendsBullets);

	}

	/**
	 * Инициализация игры
	 */
	public init(){

		this.initScene();
		this.initListeners();

	}

	/**
	 * Установка обработчиков мыши и клавиатуры
	 */
	protected initListeners(){

		window.addEventListener('mousedown', (event) => {

			this.mousePositionX = event.clientX;
			this.mousePositionY = event.clientY;

			if(this.shipMovingAllow){
				this.shipMovingActive = true;
				this.ship.startEngines();
			}

		});

		window.addEventListener('mousemove', (event) => {

			this.mousePositionX = event.clientX;
			this.mousePositionY = event.clientY;

		});

		window.addEventListener('mouseup', (event) => {

			this.mousePositionX = event.clientX;
			this.mousePositionY = event.clientY;

			if(this.shipMovingAllow) {
				this.shipMovingActive = false;
				this.ship.stopEngines();
			}

		});

		window.addEventListener('keydown', (event) => {

			if (event.code === 'Space') {

				event.preventDefault();

				if (this.shipFireAllow) {
					this.shipFireActive = true;
				}

			}else if(event.code == 'KeyJ'){

				event.preventDefault();

				if(this.shipAltFireAllow){
					this.shipAltFireActive = true;
				}

			}

		});

		window.addEventListener('keyup', (event) => {

			if (event.code === 'Space') {
				this.shipFireActive = false;
			}else if(event.code === 'KeyJ'){
				this.shipAltFireActive = false;
			}

		});

	}

	/**
	 * Инициализация сцены
	 */
	protected initScene(){

		this.scene.add(
			this.ship,
			this.sun,
			this.background,
			this.asteroidBelt,
			this.border,
			this.friendsBullets,
			this.enemiesBullets,
			...this.planets
		)

		this.moveCameraToShip();

		if(this.showAxis){
			this.showAxisHelper();
		}

	}

	/**
	 * Показать оси X,Y,Z
	 */
	protected showAxisHelper() : void
	{
		this.scene.add(
			new THREE.AxesHelper(20)
		);
	}

	/**
	 * Проверяем нахождение на орбите
	 */
	protected checkProximityToOrbit(orbit : Orbit, proximityDistance : number)  : boolean
	{

		let distanceToOrbit = this.ship.position.distanceTo(new THREE.Vector3(0, 0, 0));

		return Math.abs(distanceToOrbit - orbit.radius) < proximityDistance;

	}

	/**
	 * Проверяем нахождение на планете
	 */
	protected checkProximityToPlanet(planet : PlanetWithOrbit, proximityDistance : number) : boolean
	{

		let distance = this.ship.position.distanceTo(planet.planet.position);

		return distance < proximityDistance;

	}

	/**
	 * Двигаем камеру за кораблем
	 */
	protected moveCameraToShip(){

		this.camera.position.x = this.ship.position.x;
		this.camera.position.y = this.ship.position.y - 15;
		this.camera.position.z = this.ship.position.z + 10;
		this.camera.lookAt(
			this.ship.position.clone().setZ(0)
		);

	}

	/**
	 * Обновляем позицию корабля
	 */
	protected updateShipPosition(){

		// Обновление координат мыши
		let mouse = new THREE.Vector2(
			(this.mousePositionX / window.innerWidth) * 2 - 1,
			-(this.mousePositionY / window.innerHeight) * 2 + 1
		);

		// Обновление raycaster и нахождение пересечения с плоскостью
		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, this.camera);

		// Ограничение перемещения корабля в плоскости XY
		let plane = new THREE.Plane(new THREE.Vector3(0,0,1), 0);
		let intersection = new THREE.Vector3(0, 0, 0);
		raycaster.ray.intersectPlane(plane, intersection);

		let distance = intersection.distanceTo(
			new Vector3(0, 0, 0)
		);

		if (distance > this.border.radius) {
			intersection.normalize().multiplyScalar(this.border.radius);
		}

		this.ship.moveTo(intersection);

	}

	/**
	 * Анимируем наши пули
	 */
	protected animateShipBullets(){

		this.friendsBullets.animate(
			[
				...this.planets.map(planet => planet.planet.getPlanetMesh()),
				this.sun.getSunMesh()
			],
			this.enemies
		)

	}

	/**
	 * Анимируем вражеские пули
	 */
	protected animateEnemiesBullets(){

		this.enemiesBullets.animate(
			[
				...this.planets.map(planet => planet.planet.getPlanetMesh()),
				this.sun.getSunMesh()
			],
			[
				this.ship
			]
		);

	}

	/**
	 * Добавляем врага
	 */
	protected addEnemy(){

		let enemy = new EnemyReaper(
			Random.int(100, 500),
			Random.int(-this.border.radius, this.border.radius),
			Random.int(-this.border.radius, this.border.radius),
			this.enemiesBullets
		);

		this.enemies.push(enemy);

		this.scene.add(enemy);

	}

	/**
	 * Анимируем поведение врагов
	 */
	protected animateEnemies(){

		this.enemies.filter(enemy => enemy.health > 0).forEach(enemy => {

			//Дистанция до нас
			let distance = this.ship.position.distanceTo(enemy.position);

			if(distance > 30){

				//Ближайшая планета
				let planet = this.planets.reduce((p, t) => {
					return p.planet.position.distanceTo(enemy.position) > t.planet.position.distanceTo(enemy.position) ? t : p;
				});

				enemy.setAttackTarget(planet.planet);
				enemy.stopAutoFire();

			}else{
				enemy.setAttackTarget(this.ship);
				enemy.startAutoFire();
			}

			enemy.animate();

		});

		//Удаляем уничтоженных врагов
		this.enemies = this.enemies.filter(enemy => {

			if(!enemy.isVisible){
				this.scene.remove(enemy);
				return false;
			}

			return true;

		});
	}

	/**
	 * Главная функция анимации
	 */
	protected tick(){

		//Обновление позиции для движения корабля
		if (this.shipMovingAllow) {

			if(this.shipMovingActive) {
				this.updateShipPosition();
				this.moveCameraToShip();
			}

		}

		//Стрельба из корабля
		if(this.shipFireActive){
			this.shipFireThrottler(() => this.ship.fire(
				new THREE.Vector3(0, -1, 0).applyQuaternion(this.ship.quaternion).normalize()
			));
		}

		//Стрельба из корабля
		if(this.shipAltFireActive){
			this.shipAltFireThrottler(() => this.ship.altFire());
		}


		//Отображаем название активной планеты
		this.planets.forEach((planet : PlanetWithOrbit) => {

			planet.orbit.setActive(
				this.checkProximityToOrbit(planet.orbit!,  1.2)
			);

			planet.planet.setActive(
				this.checkProximityToPlanet(planet, 1.5)
			);

		});

		//Анимируем солнце
		this.sun.animate();

		//Анимируем двигатели корабля
		this.ship.animate();

		//Анимируем наши пули
		this.animateShipBullets();

		//Анимируем вражеские пули
		this.animateEnemiesBullets();

		//Анимируем действия врагов
		this.animateEnemies();

		//Добавляем врагов
		if(this.enemies.length < this.enemyMaxCount){
			this.enemySpawnThrottler(() => this.addEnemy());
		}

	}

	public afterTick(){
	}

}