import Engine from "./Engine.ts";
import * as THREE from "three";
import Sun from "../Components/Sun";
import Planet from "../Components/Planet";
import Background from "../Components/Background.ts";
import Orbit from "../Components/Orbit.ts";
import AsteroidBelt from "../Components/AsteroidBelt.ts";
import Border from "../Components/Border.ts";
import {Vector3} from "three";
import WarShip from "../Components/WarShip.ts";
import Enemy from "../Components/Enemy.ts";
import Bullet from "../Components/Bullet.ts";

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

	protected background : Background;
	protected ship : WarShip;
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

		this.ship = new WarShip();

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

		let enemy = await new Enemy(100, THREE.MathUtils.randInt(-30, 30), THREE.MathUtils.randInt(-30, 30)).load();

		enemy.addTo(this.scene);

		this.enemies.push(enemy);

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
				this.shipMovingTarget = this.ship.mesh!.position;
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
		this.sun.addTo(this.scene);
		this.background.addTo(this.scene);
		this.asteroidBelt.addTo(this.scene);
		this.border.addTo(this.scene);

		this.planets.forEach(planet => planet.addTo(this.scene));

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

		let distanceToOrbit = this.ship.mesh!.position.distanceTo(new THREE.Vector3(0, 0, 0));

		return Math.abs(distanceToOrbit - orbit.radius) < proximityDistance;

	}

	protected checkProximityToPlanet(planet : Planet, proximityDistance : number) : boolean
	{

		let distance = this.ship.mesh!.position.distanceTo(planet.mesh!.position);

		return distance < proximityDistance;

	}

	protected moveCameraToShip(){

		// Перемещение камеры за кораблем
		this.camera.position.x = this.ship.mesh!.position.x;
		this.camera.position.y = this.ship.mesh!.position.y - 15; // Камера будет находиться ниже корабля
		this.camera.position.z = this.ship.mesh!.position.z + 10; // Камера будет находиться позади корабля
		this.camera.lookAt(
			this.ship.mesh!.position.clone().setZ(0)
		);

	}

	protected updateShipMovingTarget(){

		// Обновление координат мыши
		let mouse = new THREE.Vector2();
		mouse.x = (this.mousePositionX / window.innerWidth) * 2 - 1;
		mouse.y = -(this.mousePositionY / window.innerHeight) * 2 + 1;

		// Обновление raycaster и нахождение пересечения с плоскостью
		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, this.camera);

		// Ограничение перемещения корабля в плоскости XY
		let plane = new THREE.Plane(new THREE.Vector3(0,0,1), 0);
		let intersection = new THREE.Vector3(0, 0, 0);
		raycaster.ray.intersectPlane(plane, intersection);

		let center = new Vector3(0, 0, 0)
		let distance = intersection.distanceTo(center);

		if (distance > this.border.radius) {
			intersection.sub(center).normalize().multiplyScalar(this.border.radius).add(center);
		}

		this.shipMovingTarget = intersection;

	}

	protected async tick(){

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
				this.checkProximityToPlanet(planet, 1.2)
			);

		});

		//Анимируем солнце
		this.sun.animateSparks();

		//Анимируем двигатели корабля
		this.ship.animateEngines();

		//Проверяем столкновение пуль с объектами
		this.ship.bullets.forEach((bullet : Bullet) => {

			if(bullet.length > 200){
				//Если пуля улетела за 200, то просто удаляем ее
				bullet.hide();
			}else if(bullet.isMoving){

				//Столкновение с безобидными объектами
				let peaceObjects = [
					...this.planets.map(planet => planet.mesh!),
					this.sun.mesh!
				];

				if(peaceObjects.some(object => bullet.checkCollisionWith(object))){
					bullet.boof();
				}

				//Столкновение с вражескими кораблями
				this.enemies.some(enemy => {

					if(bullet.checkCollisionWith(enemy.mesh!)){

						bullet.boom();
						enemy.hit(bullet.force);

						return true;
					}

					return false;

				});

				//Удаляем ненужные корабли
				this.enemies = this.enemies.filter(enemy => {

					if(!enemy.isVisible){
						this.scene.remove(enemy.group!);
						return false;
					}

					return true;

				});

			}

			if(bullet.isVisible && bullet.isMoving) {
				bullet.animate();
			}

		});

		this.ship.clearBullets();


		//Анимация пояса астероидов
		// this.belt.animateCollision(this.ship.mesh!);



	}

}