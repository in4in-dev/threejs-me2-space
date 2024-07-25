import Engine from "./Engine";
import * as THREE from "three";
import Sun from "../Components/Sun";
import Background from "../Components/Background";
import Orbit from "../Components/Orbit";
import AsteroidBelt from "../Components/AsteroidBelt";
import Border from "../Components/Border";
import {AxesHelper, Vector3} from "three";
import Mob from "../Components/Mob";
import EnemyReaper from "../Components/Enemies/EnemyReaper";
import {NormandyShip} from "../Components/Ships/Normandy/NormandyShip";
import AttacksContainer from "../Containers/AttacksContainer";
import PlanetWithOrbit from "../Components/PlanetWithOrbit";
import Random from "../../Three/Random";
import {Animation, AnimationThrottler} from "../../Three/Animation";
import HealsContainer from "../Containers/HealsContainer";
import Enemy from "../Components/Enemy";
import FriendHammerhead from "../Components/Friends/FriendHammerhead";
import MobsContainer from "../Containers/MobsContainer";
import SkillsHtmlViewer from "../Html/SkillsHtmlViewer";
import HpHtmlViewer from "../Html/HpHtmlViewer";

export default class Game extends Engine
{

	protected shipMovingAllow : boolean = true;
	protected shipMovingActive : boolean = false;

	protected shipFireAllow : boolean = true;
	protected shipFireActive : boolean = false;
	protected shipFireThrottler : AnimationThrottler = Animation.createThrottler(100);

	protected shipShockwaveFireAllow : boolean = true;
	protected shipShockwaveFireActive : boolean = false;
	protected shipShockwaveFireThrottler : AnimationThrottler = Animation.createThrottler(2000);

	protected shipRocketFireAllow : boolean = true;
	protected shipRocketFireActive : boolean = false;
	protected shipRocketFireThrottler : AnimationThrottler = Animation.createThrottler(10000);

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

	protected enemiesContainer : MobsContainer<Enemy>;
	protected friendsContainer : MobsContainer<Mob>;

	protected enemiesAttacks : AttacksContainer;
	protected friendsAttacks : AttacksContainer;

	protected healsContainer : HealsContainer;

	protected shipHpIndicator : HpHtmlViewer;
	protected skillsIndicator : SkillsHtmlViewer;

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

		this.friendsContainer = new MobsContainer<Mob>;
		this.enemiesContainer = new MobsContainer<Enemy>;

		this.ship = new NormandyShip(10, 10, 0.3, this.friendsAttacks);

		this.shipHpIndicator = new HpHtmlViewer(this.ship.health, this.ship.maxHealth);
		this.skillsIndicator = new SkillsHtmlViewer;

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

				if(this.shipShockwaveFireAllow){
					this.shipShockwaveFireActive = true;
				}

			}else if(event.code === 'KeyH'){

				event.preventDefault();

				this.friendsSpawnActive = true;

			}else if(event.code === 'KeyK'){

				event.preventDefault();

				if(this.shipRocketFireAllow) {
					this.shipRocketFireActive = true;
				}

			}

		});

		window.addEventListener('keyup', (event) => {

			if (event.code === 'Space') {
				this.shipFireActive = false;
			}else if(event.code === 'KeyJ'){
				this.shipShockwaveFireActive = false;
			}else if(event.code === 'KeyH'){
				this.friendsSpawnActive = false;
			}else if(event.code === 'KeyK'){
				this.shipRocketFireActive = false;
			}

		});

	}

	protected initHtml(){
		document.body.appendChild(this.shipHpIndicator.element);
		document.body.appendChild(this.skillsIndicator.element);
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
			this.enemiesContainer,
			this.friendsContainer,
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
			this.enemiesContainer.getAliveMobs()
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
				...this.friendsContainer.getAliveMobs()
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

		this.enemiesContainer.addMobs(enemy);

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

		this.friendsContainer.addMobs(friend);

	}

	/**
	 * Анимируем поведение врагов
	 */
	protected animateEnemies(){

		this.enemiesContainer.getAliveMobs().forEach(enemy => {

			//Дистанция до нас
			enemy.setNearestAttackTarget(
				[
					this.ship,
					...this.friendsContainer.getAliveMobs()
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

		this.enemiesContainer.animate();

	}

	protected animateFriends(){

		this.friendsContainer.getAliveMobs().forEach(friend => {

			//Выбираем ближайшую цель
			friend.setNearestAttackTarget(
				this.enemiesContainer.getAliveMobs(),
				50
			);

			if(!friend.hasAttackTarget()){
				friend.setAttackTarget(this.ship);
				friend.stopAutoFire();
			}else{
				friend.startAutoFire();
			}

			//Анимируем поведение
			friend.animate();

		});

		this.friendsContainer.animate();

	}

	protected updateShipHp(){

		this.shipHpIndicator.setHealth(this.ship.health);

		if(!this.ship.health){
			//@TODO пока просто восстанавливаем здоровье
			this.ship.heal(this.ship.maxHealth);
		}

	}

	protected updateSkillsStatus(){

		let beforeFire = this.shipFireThrottler.getBeforeCall(),
			delayFire = this.shipFireThrottler.getDelay(),
			cooldownFire = (1 - beforeFire / delayFire);

		this.skillsIndicator.fireSkill.setCooldown(cooldownFire);

		let beforeShockWave = this.shipShockwaveFireThrottler.getBeforeCall(),
			delayShockWave = this.shipShockwaveFireThrottler.getDelay(),
			cooldownShockWave = (1 - beforeShockWave / delayShockWave);

		this.skillsIndicator.waveSkill.setCooldown(cooldownShockWave);


		let beforeFriendSpawn = this.friendsSpawnThrottler.getBeforeCall(),
			delayFriendSpawn = this.friendsSpawnThrottler.getDelay(),
			cooldownFriendSpawn = (1 - beforeFriendSpawn / delayFriendSpawn),
			aliveCountFriends = this.friendsContainer.getAliveMobs().length;

		if(aliveCountFriends === this.friendsMaxCount){
			cooldownFriendSpawn = 0;
		}

		this.skillsIndicator.friendSkill.setCooldown(cooldownFriendSpawn);
		this.skillsIndicator.friendSkill.setCounterValue(this.friendsMaxCount - aliveCountFriends);
		this.skillsIndicator.friendSkill.setCounterMax(this.friendsMaxCount);


		let beforeRocket = this.shipRocketFireThrottler.getBeforeCall(),
			delayRocket = this.shipRocketFireThrottler.getDelay(),
			cooldownRocket = (1 - beforeRocket / delayRocket);

		if(this.enemiesContainer.getAliveMobs().length < 1){
			cooldownRocket = 0;
		}

		this.skillsIndicator.rocketSkill.setCooldown(cooldownRocket);

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
		if(this.shipShockwaveFireActive){
			this.shipShockwaveFireThrottler(() => this.ship.shockwaveFire());
		}

		//Стрельба (второй режим) из корабля
		if(this.shipRocketFireActive){

			let enemies = this.enemiesContainer.getAliveMobs();

			if(enemies.length){

				let target = this.ship.whoNearest(enemies);

				if(target) {
					this.shipRocketFireThrottler(() => this.ship.rocketFire(target));
				}

			}


		}

		//Спавн союзников
		if(this.friendsSpawnActive && this.friendsContainer.getAliveMobs().length < this.friendsMaxCount){
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
		if(this.enemiesContainer.getAliveMobs().length < this.enemyMaxCount){
			this.enemySpawnThrottler(() => this.addEnemy());
		}

		//Анимируем кд
		this.updateSkillsStatus();

	}

	public afterTick(){
	}

}