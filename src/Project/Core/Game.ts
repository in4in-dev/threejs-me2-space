import Engine from "./Engine";
import * as THREE from "three";
import Sun from "../Components/Sun";
import Background from "../Components/Background";
import Orbit from "../Components/Orbit";
import AsteroidBelt from "../Components/AsteroidBelt";
import Border from "../Components/Border";
import {Vector3} from "three";
import Mob from "../Components/Mob";
import EnemyReaper from "../Components/Enemies/EnemyReaper";
import {NormandyShip} from "../Components/Ships/Normandy/NormandyShip";
import AttacksContainer from "../Components/AttacksContainer";
import PlanetWithOrbit from "../Components/PlanetWithOrbit";
import Random from "../../Three/Random";
import {Animation, AnimationThrottler} from "../../Three/Animation";
import HealsContainer from "../Components/HealsContainer";
import Enemy from "../Components/Enemy";
import FriendHammerhead from "../Components/Friends/FriendHammerhead";

export default class Game extends Engine
{

	protected shipMovingAllow : boolean = true;
	protected shipMovingActive : boolean = false;

	protected shipFireAllow : boolean = true;
	protected shipFireActive : boolean = false;
	protected shipFireThrottler : AnimationThrottler = Animation.createThrottler(100);

	protected shipAltFireAllow : boolean = true;
	protected shipAltFireActive : boolean = false;
	protected shipAltFireThrottler : AnimationThrottler = Animation.createThrottler(2000);

	protected mousePositionX : number = 0;
	protected mousePositionY : number = 0;

	protected enemyMaxCount : number = 3;
	protected enemySpawnThrottler : AnimationThrottler = Animation.createThrottler(5000);

	protected friendsMaxCount : number = 3;
	protected friendsSpawnActive : boolean = false;
	protected friendsSpawnThrottler : AnimationThrottler = Animation.createThrottler(5000);

	protected showAxis : boolean = false;

	protected background : Background;
	protected ship : NormandyShip;
	protected sun : Sun;
	protected border : Border;
	protected asteroidBelt : AsteroidBelt;
	protected planets : PlanetWithOrbit[] = [];
	protected enemies : Enemy[] = [];
	protected friends : Mob[] = [];

	protected enemiesAttacks : AttacksContainer;
	protected friendsAttacks : AttacksContainer;

	protected healsContainer : HealsContainer;

	protected shipHpIndicator : HTMLElement;
	protected skillsIndicator : HTMLElement;

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

		this.enemiesAttacks = new AttacksContainer;
		this.friendsAttacks = new AttacksContainer;
		this.healsContainer = new HealsContainer;

		this.ship = new NormandyShip(10, 10, 0.3, this.friendsAttacks);

		//@TODO Hp indicator
		let hpDiv = document.createElement('div');
		hpDiv.className = 'ship-hp';
		hpDiv.innerHTML = '<div class="ship-hp__bar"></div>';

		this.shipHpIndicator = hpDiv;

		//@TODO Skills indicator
		let skillsDiv = document.createElement('div');
		skillsDiv.className = 'skills';
		skillsDiv.innerHTML = [
			`<div class="skills__row skills__row--fire"><i class="skills__row-cd"></i><i class="skills__row-picture skills__row-picture--fire"></i><span class="skills__row-key">SPACE</span></div>`,
			`<div class="skills__row skills__row--wave"><i class="skills__row-cd"></i><i class="skills__row-picture skills__row-picture--wave"></i><span class="skills__row-key">J</span></div>`,
			`<div class="skills__row skills__row--friend"><i class="skills__row-cd"></i><i class="skills__row-picture skills__row-picture--friend"></i><span class="skills__row-key">H</span></div>`,
		].join("");

		this.skillsIndicator = skillsDiv;

	}

	/**
	 * Инициализация игры
	 */
	public init(){

		this.initScene();
		this.initHtml();
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

			}else if(event.code === 'KeyJ'){

				event.preventDefault();

				if(this.shipAltFireAllow){
					this.shipAltFireActive = true;
				}

			}else if(event.code === 'KeyH'){

				event.preventDefault();

				this.friendsSpawnActive = true;

			}

		});

		window.addEventListener('keyup', (event) => {

			if (event.code === 'Space') {
				this.shipFireActive = false;
			}else if(event.code === 'KeyJ'){
				this.shipAltFireActive = false;
			}else if(event.code === 'KeyH'){
				this.friendsSpawnActive = false;
			}

		});

	}

	protected initHtml(){
		document.body.appendChild(this.shipHpIndicator);
		document.body.appendChild(this.skillsIndicator);
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
			this.friendsAttacks,
			this.enemiesAttacks,
			this.healsContainer,
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
	protected animateFriendsAttacks(){

		this.friendsAttacks.animate(
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
	protected animateEnemiesAttacks(){

		this.enemiesAttacks.animate(
			[
				...this.planets.map(planet => planet.planet.getPlanetMesh()),
				this.sun.getSunMesh()
			],
			[
				this.ship,
				...this.friends
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
			0.05,
			this.enemiesAttacks,
			this.healsContainer
		);

		this.enemies.push(enemy);

		this.scene.add(enemy);

	}

	/**
	 * Добавляем врага
	 */
	protected addFriend(){

		let friend = new FriendHammerhead(
			Random.int(500, 2000),
			this.ship.position.x + Random.int(-2, 2),
			this.ship.position.y + Random.int(-2, 2),
			0.1,
			this.friendsAttacks
		);

		this.friends.push(friend);

		this.scene.add(friend);

	}

	/**
	 * Анимируем поведение врагов
	 */
	protected animateEnemies(){

		this.enemies.filter(enemy => enemy.health > 0).forEach(enemy => {

			//Дистанция до нас
			enemy.setNearestAttackTarget(
				[
					this.ship,
					...this.friends.filter(friend => friend.health > 0)
				],
				50
			);

			if(enemy.hasAttackTarget()){
				enemy.startAutoFire();
			}else{

				enemy.setNearestAttackTarget(
					this.planets.map(planet => planet.planet)
				);

				enemy.stopAutoFire();

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

	protected animateFriends(){

		this.friends.filter(friend => friend.health > 0).forEach(friend => {

			//Выбираем ближайшую цель
			friend.setNearestAttackTarget(
				this.enemies.filter(friend => friend.health > 0),
				50
			);

			//Разрешаем стрельбу
			friend.startAutoFire();

			//Анимируем поведение
			friend.animate();

		});

		//Удаляем уничтоженных союзников
		this.friends = this.friends.filter(friend => {

			if(!friend.isVisible){
				this.scene.remove(friend);
				return false;
			}

			return true;

		});

	}

	protected updateShipHp(){

		let percent = this.ship.health / this.ship.maxHealth * 100;

		(<HTMLElement>this.shipHpIndicator.children[0]).style.width = percent.toFixed(2) + '%';

		if(!this.ship.health){
			//@TODO пока просто восстанавливаем здоровье
			this.ship.heal(this.ship.maxHealth);
		}

	}

	protected updateSkillsStatus(){

		let beforeFire = this.shipFireThrottler.getBeforeCall(),
			delayFire = this.shipFireThrottler.getDelay(),
			cooldownFire = (1 - beforeFire / delayFire);

		(<HTMLElement>this.skillsIndicator.querySelector('.skills__row--fire .skills__row-cd')).style.width = (cooldownFire * 100).toFixed(2) + '%';


		let beforeShockWave = this.shipAltFireThrottler.getBeforeCall(),
			delayShockWave = this.shipAltFireThrottler.getDelay(),
			cooldownShowWave = (1 - beforeShockWave / delayShockWave);

		(<HTMLElement>this.skillsIndicator.querySelector('.skills__row--wave .skills__row-cd')).style.width = (cooldownShowWave * 100).toFixed(2) + '%';


		let beforeFriendSpawn = this.friendsSpawnThrottler.getBeforeCall(),
			delayFriendSpawn = this.friendsSpawnThrottler.getDelay(),
			cooldownFriendSpawn = (1 - beforeFriendSpawn / delayFriendSpawn);

		if(this.friends.length === this.friendsMaxCount){
			cooldownFriendSpawn = 0;
		}

		(<HTMLElement>this.skillsIndicator.querySelector('.skills__row--friend .skills__row-cd')).style.width = (cooldownFriendSpawn * 100).toFixed(2) + '%';

	}

	/**
	 * Главная функция анимации
	 */
	protected tick(){

		//Обновляем здоровье корабля
		this.updateShipHp();

		//Обновление позиции для движения корабля
		if (this.shipMovingAllow) {

			if(this.shipMovingActive) {
				this.updateShipPosition();
				this.moveCameraToShip();
			}

		}

		//Стрельба из корабля
		if(this.shipFireActive){
			this.shipFireThrottler(() => this.ship.fire());
		}

		//Стрельба (второй режим) из корабля
		if(this.shipAltFireActive){
			this.shipAltFireThrottler(() => this.ship.altFire());
		}

		//Спавн союзников
		if(this.friendsSpawnActive && this.friends.length < this.friendsMaxCount){
			this.friendsSpawnThrottler(() => this.addFriend());
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
		this.animateFriendsAttacks();

		//Анимируем вражеские пули
		this.animateEnemiesAttacks();

		//Анимируем действия врагов
		this.animateEnemies();

		//Анимируем друзей
		this.animateFriends();

		//Анимация хилок
		this.healsContainer.animate([
			this.ship
		]);

		//Добавляем врагов
		if(this.enemies.length < this.enemyMaxCount){
			this.enemySpawnThrottler(() => this.addEnemy());
		}

		//Анимируем кд
		this.updateSkillsStatus();

	}

	public afterTick(){
	}

}