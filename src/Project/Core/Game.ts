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
import DropContainer from "../Containers/DropContainer";
import Enemy from "../Components/Enemy";
import FriendHammerhead from "../Components/Friends/FriendHammerhead";
import MobsContainer from "../Containers/MobsContainer";
import SkillsHtmlViewer from "../Html/SkillsHtmlViewer";
import HpHtmlViewer from "../Html/HpHtmlViewer";
import Skill from "./Skill";
import FriendRelay from "../Components/Friends/FriendRelay";
import Heal from "../Components/Heal";
import Healthy from "../Contracts/Healthy";
import Experience from "../Components/Experience";
import Experienced from "../Contracts/Experienced";
import ExpHtmlViewer from "../Html/ExpHtmlViewer";

export default class Game extends Engine
{

	protected shipMovingAllow : boolean = true;
	protected shipMovingActive : boolean = false;

	protected shipFireSkill : Skill;
	protected shipShockwaveSkill : Skill;
	protected shipRocketSkill : Skill;
	protected shipFriendSkill : Skill;
	protected relayShieldSkill : Skill;

	protected mousePositionX : number = 0;
	protected mousePositionY : number = 0;

	protected enemyMaxCount : number = 7;
	protected enemyCounter : number = 0;
	protected enemySpawnThrottler : AnimationThrottler = Animation.createThrottler(5000);

	protected healSpawnThrottler : AnimationThrottler = Animation.createThrottler(30000);

	protected friendsMaxCount : number = 3;

	protected showAxis : boolean = false;

	protected background : Background;
	protected ship : NormandyShip;
	protected sun : Sun;
	protected border : Border;
	protected asteroidBelt : AsteroidBelt;
	protected planets : PlanetWithOrbit[] = [];

	protected enemiesContainer : MobsContainer<Enemy>;
	protected friendsContainer : MobsContainer<Mob>;
	protected relaysContainer : MobsContainer<FriendRelay>;

	protected enemiesAttacks : AttacksContainer;
	protected friendsAttacks : AttacksContainer;

	protected healsContainer : DropContainer<Healthy, Heal>;
	protected expContainer : DropContainer<Experienced, Experience>;

	protected shipHpIndicator : HpHtmlViewer;
	protected skillsIndicator : SkillsHtmlViewer;
	protected expIndicator : ExpHtmlViewer;

	protected shipFriendLevel : number = 1;
	protected shipHealthLevel : number = 1;
	protected relaysLevel : number = 1;
	protected enemiesLevel : number = 1;

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
		this.healsContainer = new DropContainer<Healthy, Heal>;
		this.expContainer   = new DropContainer<Experienced, Experience>;

		this.friendsContainer = new MobsContainer<Mob>;
		this.enemiesContainer = new MobsContainer<Enemy>;
		this.relaysContainer = new MobsContainer<FriendRelay>;

		this.ship = new NormandyShip(this.friendsAttacks);

		this.shipFireSkill      = new Skill('SPACE', 'Space', 100);
		this.shipShockwaveSkill = new Skill('J', 'KeyJ', 5000);
		this.shipFriendSkill    = new Skill('H', 'KeyH', 5000, this.friendsMaxCount);
		this.shipRocketSkill    = new Skill('K', 'KeyK', 20000);
		this.relayShieldSkill   = new Skill('G', 'KeyG', 90000);

		let costCounter = (level : () => number, costs : number[]) => {
			return () => {

				let l = level();

				return l > costs.length ? costs[costs.length - 1] : costs[l - 1];

			}
		}

		this.skillsIndicator = new SkillsHtmlViewer(this.ship)
			.addSkill('fire', this.shipFireSkill, costCounter(() => this.ship.fireLevel, [100, 1000, 3000, 5000, 10000, 20000, 50000]), () => {
				this.ship.fireLevel++;
			})
			.addSkill('wave', this.shipShockwaveSkill, costCounter(() => this.ship.shockWaveLevel, [5000, 10000, 20000, 50000, 100000]), () => {
				this.ship.shockWaveLevel++;
			})
			.addSkill('rocket', this.shipRocketSkill, costCounter(() => this.ship.rocketLevel, [10000, 20000, 50000, 100000, 200000]), () => {
				this.ship.rocketLevel++;
			})
			.addSkill('friend', this.shipFriendSkill, costCounter(() => this.shipFriendLevel, [10000, 20000, 50000, 100000, 200000]), () => {
				this.shipFriendLevel++
				this.friendsMaxCount = Math.min(this.friendsMaxCount + 1, 7);
				this.shipFriendSkill.setMaxUses(this.friendsMaxCount);
			})
			.addSkill('shield', this.relayShieldSkill, costCounter(() => this.relaysLevel, [50000, 100000, 200000, 500000]), () => {
				this.relaysLevel++;
				this.relaysContainer.getAliveMobs().forEach(relay => relay.level++);
			});

		this.shipHpIndicator = new HpHtmlViewer(this.ship.health, this.ship.maxHealth);
		this.expIndicator = new ExpHtmlViewer(this.ship.experience);


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

		this.shipFireSkill.initListeners();
		this.shipShockwaveSkill.initListeners();
		this.shipRocketSkill.initListeners();
		this.shipFriendSkill.initListeners();
		this.relayShieldSkill.initListeners();

	}

	protected initHtml(){
		document.body.appendChild(this.shipHpIndicator.element);
		document.body.appendChild(this.skillsIndicator.element);
		document.body.appendChild(this.expIndicator.element);
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
			this.expContainer,
			this.enemiesContainer,
			this.friendsContainer,
			this.relaysContainer,
			...this.planets
		)

		this.ship.position.set(10, 10, 0);
		this.moveCameraToShip();

		if(this.showAxis){
			this.showAxisHelper();
		}

		this.addRelay(new Vector3(10, 10, 0))
		this.addRelay(new Vector3(20, -20, 0))
		this.addRelay(new Vector3(0, -60, 0))
		this.addRelay(new Vector3(-60, 10, 0))
		this.addRelay(new Vector3(50, 40, 0))
		this.addRelay(new Vector3(50, -50, 0))

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
				...this.relaysContainer.getAliveMobs(),
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
				...this.relaysContainer.getAliveMobs(),
				...this.friendsContainer.getAliveMobs()
			]
		);

	}

	protected addRelay(cords : Vector3){

		let relay = new FriendRelay(
			1,
			this.friendsAttacks
		);

		relay.position.copy(cords.setZ(0));

		relay.rotation.z = Math.random() * Math.PI * 2;

		this.relaysContainer.addMobs(
			relay
		);

	}

	/**
	 * Добавляем врага
	 */
	protected addEnemy(){

		let enemy = new EnemyReaper(
			this.enemiesLevel,
			this.enemiesAttacks,
			this.healsContainer,
			this.expContainer
		);

		enemy.position.set(
			Random.int(-this.border.radius, this.border.radius),
			Random.int(-this.border.radius, this.border.radius),
			0
		)

		this.enemiesContainer.addMobs(enemy);

		this.enemyCounter++;

	}

	/**
	 * Добавляем врага
	 */
	protected addFriend(){

		let friend = new FriendHammerhead(
			this.shipFriendLevel,
			this.friendsAttacks
		);

		friend.position.set(
			this.ship.position.x + Random.int(-2, 2),
			this.ship.position.y + Random.int(-2, 2),
			0
		)

		this.friendsContainer.addMobs(friend);

	}

	/**
	 * Анимируем поведение врагов
	 */
	protected animateEnemies(){

		this.enemiesContainer.getAliveMobs().forEach(enemy => {

			enemy.startAutoFire();

			//Дистанция до нас
			enemy.setNearestAttackTarget(
				[
					this.ship,
					...this.friendsContainer.getAliveMobs()
				],
				30
			);

			if(!enemy.hasAttackTarget()){

				enemy.setNearestAttackTarget(
					this.relaysContainer.getAliveMobs()
				);

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

	protected animateRelays(){
		this.relaysContainer.animate();
		this.relaysContainer.getAliveMobs().forEach(relay => relay.animate());
	}

	protected animateShipHp(){

		this.shipHpIndicator.setHealth(this.ship.health);

	}

	protected animateSkills(){

		//Стрельба из корабля
		this.shipFireSkill.useIfNeed(() => this.ship.fire());

		//Шоковая волна
		let shockWaveTargets = this.enemiesContainer.getAliveMobs().filter(enemy => {
			return enemy.position.distanceTo(this.ship.position) <= this.ship.getShockwaveRadius();
		});

		this.shipShockwaveSkill
			.toggle(shockWaveTargets.length > 0)
			.useIfNeed(() => this.ship.shockwaveFire());

		//Ракета
		let enemies = this.enemiesContainer.getAliveMobs();

		if(enemies.length){

			let target = this.ship.whoNearest(enemies);

			if(target){
				this.shipRocketSkill.on().useIfNeed(() => this.ship.rocketFire(target));
			}

		}else{

			this.shipRocketSkill.off();

		}

		//Spawn союзников
		this.shipFriendSkill
			.setAvailableUses(this.friendsMaxCount - this.friendsContainer.getAliveMobs().length)
			.useIfNeed(() => this.addFriend());


		//Щит ретранслятора
		this.relayShieldSkill.useIfNeed(() => {
			this.relaysContainer.getAliveMobs().forEach(relay => relay.activateShield(10000))
		});

		//Анимируем кд
		this.skillsIndicator.updateView();

	}

	/**
	 * То, что нужно обновлять по реже
	 */
	protected slowTick(){

		//Обновляем уровень здоровья
		this.ship.setHealthLevel(this.shipHealthLevel);

		this.expIndicator.setValue(this.ship.experience);

		//Обновляем отображение здоровья корабля
		this.animateShipHp();

		//Анимируем скиллы
		this.animateSkills();

		//Добавляем врагов
		if(this.enemiesContainer.getAliveMobs().length < this.enemyMaxCount){

			this.enemySpawnThrottler(() => {

				if(this.enemyCounter && !(this.enemyCounter % 10)){
					this.shipHealthLevel++;
					this.enemiesLevel++;
				}

				this.addEnemy();

			});
		}

		if(!this.ship.health){
			alert('Корабль уничтожен');
			this.stop();
			location.reload();
		}

		if(!this.relaysContainer.getAliveMobs().length){
			alert('Ретрансляторы уничтожены');
			this.stop();
			location.reload();
		}

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

		//Анимируем действия друзей
		this.animateFriends();

		//Анимация ретрансляторов
		this.animateRelays();

		//Анимация хилок
		this.healsContainer.animate([this.ship]);
		this.expContainer.animate([this.ship]);

		this.healSpawnThrottler(() => {

			let heal = new Heal(this.ship.maxHealth / 4, 0.4);
			heal.position.x = Random.int(0, 1) ? Random.int(-40, -10) : Random.int(10, 40);
			heal.position.y = Random.int(0, 1) ? Random.int(-40, -10) : Random.int(10, 40);

			this.healsContainer.addDrop(heal);

		})


	}

	public afterTick(){
	}

}