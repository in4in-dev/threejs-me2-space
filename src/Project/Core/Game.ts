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
	protected planets : Planet[] = [];
	protected enemies : Enemy[] = [];

	constructor(
		background : Background,
		sun : Sun,
		asteroidBelt : AsteroidBelt,
		planets : Planet[],
		border : Border
	) {
		super(document.body);

		this.background = background;
		this.sun = sun;
		this.asteroidBelt = asteroidBelt;
		this.planets = planets;
		this.border = border;

		this.ship = new NormandyShip(10, 10, 0.3);

	}

	public async init(){

		await this.border.load();
		await this.sun.load();
		await this.background.load();
		await this.ship.load();
		await this.asteroidBelt.load();

		for(let i in this.planets){
			await this.planets[i].load();
		}

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
				this.shipMovingTarget = this.ship.group!.position;
				this.ship.stopEngines();
			}

		});

		window.addEventListener('keydown', (event) => {

			event.preventDefault();

			if (event.code === 'Space' && this.shipFireAllow) {
				this.shipFireActive = true;
				this.shipFireLastTime = 0;
			}

		});

		window.addEventListener('keyup', (event) => {

			if (event.code === 'Space') {
				this.shipFireActive = false;
			}

		});

	}

	protected initScene(){

		this.ship.addTo(this.scene);
		this.scene.add(this.sun);
		this.scene.add(this.background);
		this.scene.add(this.asteroidBelt);
		this.scene.add(this.border);
		this.scene.add(...this.planets);

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

		let distanceToOrbit = this.ship.group!.position.distanceTo(new THREE.Vector3(0, 0, 0));

		return Math.abs(distanceToOrbit - orbit.radius) < proximityDistance;

	}

	protected checkProximityToPlanet(planet : Planet, proximityDistance : number) : boolean
	{

		let distance = this.ship.group!.position.distanceTo(planet.getPlanetGroup()!.position);

		return distance < proximityDistance;

	}

	protected moveCameraToShip(){

		// Перемещение камеры за кораблем
		this.camera.position.x = this.ship.group!.position.x;
		this.camera.position.y = this.ship.group!.position.y - 15; // Камера будет находиться ниже корабля
		this.camera.position.z = this.ship.group!.position.z + 10; // Камера будет находиться позади корабля
		this.camera.lookAt(
			this.ship.group!.position.clone().setZ(0)
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

		//Проверяем столкновение пуль с объектами
		this.ship.bullets.forEach((bullet : Bullet) => {

			if(bullet.length > 200){
				//Если пуля улетела за 200, то просто удаляем ее
				bullet.hide();
			}else if(bullet.isMoving){

				//Столкновение с безобидными объектами
				let peaceObjects = [
					...this.planets.map(planet => planet.getPlanetMesh()!),
					this.sun.getSunMesh()!
				];

				if(peaceObjects.some(object => bullet.checkCollisionWith(object))){
					bullet.boof();
				}

				//Столкновение с вражескими кораблями
				this.enemies.some(enemy => {

					if(bullet.checkCollisionWith(enemy.group!)){

						bullet.boom();
						enemy.hit(bullet.force);

						return true;
					}

					return false;

				});

			}

			if(bullet.isVisible && bullet.isMoving) {
				bullet.animate();
			}

		});

		//Чистим ненужные пули
		this.ship.clearBullets();

	}

	protected animateEnemiesBullets(){

		this.enemies.forEach(enemy => {

			//Проверяем столкновение вражеских пуль с объектами
			enemy.bullets.forEach((bullet : Bullet) => {

				if(bullet.length > 200){
					//Если пуля улетела за 200, то просто удаляем ее
					bullet.hide();
				}else if(bullet.isMoving){

					//Столкновение с безобидными объектами
					let peaceObjects = [
						...this.planets.map(planet => planet.getPlanetMesh()!),
						this.sun.getSunMesh()!
					];

					if(peaceObjects.some(object => bullet.checkCollisionWith(object))){
						bullet.boof();
					}

					//Столкновение с вражескими кораблями
					if(bullet.checkCollisionWith(this.ship.group!)){
						bullet.boom();
					}

				}

				if(bullet.isVisible && bullet.isMoving) {
					bullet.animate();
				}

			});

			//Удаляем ненужные пули
			enemy.clearBullets();

		});

	}

	protected async addEnemy(){

		let enemy = new EnemyReaper(
			THREE.MathUtils.randInt(100, 500),
			THREE.MathUtils.randInt(-this.border.radius, this.border.radius),
			THREE.MathUtils.randInt(-this.border.radius, this.border.radius)
		);

		this.enemies.push(enemy);

		await enemy.load();

		enemy.addTo(this.scene);

	}

	protected animateEnemies(){

		this.enemies.filter(enemy => enemy.health > 0).forEach(enemy => {

			//Дистанция до нас
			let distance = this.ship.group!.position.distanceTo(enemy.group!.position);

			if(distance > 30){

				//Ближайшая планета
				let planet = this.planets.reduce((p, t) => {
					return p.getPlanetMesh()!.position.distanceTo(enemy.group!.position) > t.getPlanetMesh()!.position.distanceTo(enemy.group!.position) ? t : p;
				});

				enemy.setAttackTarget(planet.getPlanetMesh()!);
				enemy.stopAutoFire();

			}else{
				enemy.setAttackTarget(this.ship.group!);
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
		if(this.shipFireActive && (Date.now() - this.shipFireLastTime) > 500){

			await this.ship.fire();

			this.shipFireLastTime = Date.now();

		}

		//Отображаем название активной планеты
		this.planets.forEach((planet : Planet) => {

			planet.orbit!.setActive(
				this.checkProximityToOrbit(planet.orbit!,  1.2)
			);

			planet.setActive(
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
				this.scene.remove(enemy.group!);
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