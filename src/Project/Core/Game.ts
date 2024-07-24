import Engine from "./Engine";
import * as THREE from "three";
import Sun from "../Components/Sun";
import Planet from "../Components/Planet";
import Background from "../Components/Background";
import Orbit from "../Components/Orbit";
import AsteroidBelt from "../Components/AsteroidBelt";
import Border from "../Components/Border";
import {Vector3} from "three";
import Enemy from "../Components/Enemy";
import Bullet from "../Components/Bullet";
import EnemyReaper from "../Components/Enemies/EnemyReaper";
import {NormandyShip} from "../Components/Ships/Normandy/NormandyShip";
import BulletsContainer from "../Components/BulletsContainer";
import PlanetWithOrbit from "../Components/PlanetWithOrbit";
import ModelLoader from "../../Three/ModelLoader";
import Random from "../../Three/Random";

export default class Game extends Engine
{

	protected shipMovingAllow : boolean = true;
	protected shipMovingActive : boolean = false;
	protected shipMovingTarget : any = null;

	protected shipFireAllow : boolean = true;
	protected shipFireActive : boolean = false;
	protected shipFireLastTime : number = 0;

	protected mousePositionX : number = 0;
	protected mousePositionY : number = 0;

	protected enemyLastAddedTime : number = 0;
	protected enemyMaxCount : number = 3;

	protected background : Background;
	protected ship : NormandyShip;
	protected sun : Sun;
	protected border : Border;
	protected asteroidBelt : AsteroidBelt;
	protected planets : PlanetWithOrbit[] = [];
	protected enemies : Enemy[] = [];

	protected enemiesBullets : BulletsContainer;
	protected friendsBullets : BulletsContainer;

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

		this.enemiesBullets = new BulletsContainer;
		this.friendsBullets = new BulletsContainer;

		this.ship = new NormandyShip(10, 10, 0.3, this.friendsBullets);

	}

	public async init(){

		this.initScene();
		this.initListeners();

	}

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
				this.shipMovingTarget = this.ship.position;
				this.ship.stopEngines();
			}

		});

		window.addEventListener('keydown', (event) => {

			if (event.code === 'Space') {

				event.preventDefault();

				if (this.shipFireAllow) {
					this.shipFireActive = true;
				}

			}

		});

		window.addEventListener('keyup', (event) => {

			if (event.code === 'Space') {
				this.shipFireActive = false;
			}

		});

	}

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

		// this.showAxisHelper();

	}

	protected showAxisHelper() : void
	{
		this.scene.add(
			new THREE.AxesHelper(20)
		);
	}

	protected checkProximityToOrbit(orbit : Orbit, proximityDistance : number)  : boolean
	{

		let distanceToOrbit = this.ship.position.distanceTo(new THREE.Vector3(0, 0, 0));

		return Math.abs(distanceToOrbit - orbit.radius) < proximityDistance;

	}

	protected checkProximityToPlanet(planet : PlanetWithOrbit, proximityDistance : number) : boolean
	{

		let distance = this.ship.position.distanceTo(planet.planet.position);

		return distance < proximityDistance;

	}

	protected moveCameraToShip(){

		// Перемещение камеры за кораблем
		this.camera.position.x = this.ship.position.x;
		this.camera.position.y = this.ship.position.y - 15; // Камера будет находиться ниже корабля
		this.camera.position.z = this.ship.position.z + 10; // Камера будет находиться позади корабля
		this.camera.lookAt(
			this.ship.position.clone().setZ(0)
		);

	}

	protected updateShipMovingTarget(){

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

		this.shipMovingTarget = intersection;

	}

	protected animateShipBullets(){

		this.friendsBullets.animate(
			[
				...this.planets.map(planet => planet.planet.getPlanetMesh()),
				this.sun.getSunMesh()
			],
			this.enemies
		)

	}

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

	protected async addEnemy(){

		let enemy = new EnemyReaper(
			Random.int(100, 500),
			Random.int(-this.border.radius, this.border.radius),
			Random.int(-this.border.radius, this.border.radius),
			this.enemiesBullets
		);

		this.enemies.push(enemy);

		this.scene.add(enemy);

	}

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

	}

	protected async tick(){

		// console.time('tick');

		//Обновление позиции для движения корабля
		if (this.shipMovingAllow) {

			if(this.shipMovingActive) {
				this.updateShipMovingTarget();
			}


			if(this.shipMovingTarget){

				this.ship.moveTo(this.shipMovingTarget);

				this.moveCameraToShip();

			}

		}

		//Стрельба из корабля
		if(this.shipFireActive && (Date.now() - this.shipFireLastTime) > 100){

			this.ship.fire();

			this.shipFireLastTime = Date.now();

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
		this.sun.animateSparks();

		//Анимируем двигатели корабля
		this.ship.animateEngines();

		//Анимируем наши пули
		this.animateShipBullets();

		//Анимируем вражеские пули
		this.animateEnemiesBullets();

		//Удаляем ненужные корабли
		this.enemies = this.enemies.filter(enemy => {

			if(!enemy.isVisible){
				this.scene.remove(enemy);
				return false;
			}

			return true;

		});


		//Добавляем врагов
		if(this.enemies.length < this.enemyMaxCount && Date.now() - this.enemyLastAddedTime > 5000){

			await this.addEnemy();

			this.enemyLastAddedTime = Date.now();

		}


		//Анимируем действия врагов
		this.animateEnemies();


		//Анимация пояса астероидов
		// this.belt.animateCollision(this.ship.mesh!);


	}

	public afterTick(){
		// console.timeEnd('tick');
	}

}