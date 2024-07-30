import Engine from "./Engine";
import * as THREE from "three";
import {Vector3} from "three";
import Sun from "../Components/Sun";
import Background from "../Components/Background";
import Orbit from "../Components/Orbit";
import AsteroidBelt from "../Components/AsteroidBelt";
import Border from "../Components/Border";
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
import Heal from "../Components/Drops/Heal";
import Healthy from "../Contracts/Healthy";
import Experience from "../Components/Drops/Experience";
import Experienced from "../Contracts/Experienced";
import ExpHtmlViewer from "../Html/ExpHtmlViewer";
import FpsHtmlViewer from "../Html/FpsHtmlViewer";
import RelaysHtmlViewer from "../Html/RelaysHtmlViewer";
import TechInfoHtmlViewer from "../Html/TechInfoHtmlViewer";

export default class Game extends Engine
{

	protected shipMovingAllow : boolean = true;
	protected shipMovingActive : boolean = false;

	//Скиллы корабля
	protected skillFire : Skill         = new Skill;
	protected skillShockwave : Skill    = new Skill;
	protected skillRocket : Skill       = new Skill;
	protected skillSpawnFriend : Skill  = new Skill;
	protected skillRelayShield : Skill  = new Skill;
	protected skillShield : Skill       = new Skill;

	//Позиция мыши
	protected mousePositionX : number = 0;
	protected mousePositionY : number = 0;

	//Настройки врагов
	protected enemyLevel : number = 1;
	protected enemySpawned : number = 0;
	protected enemySpawnLimit : number = 10;
	protected enemySpawnMaxCount : number = 30;
	protected enemyKilledUpdateLevel : number = 15;
	protected enemySpawnThrottler : AnimationThrottler = Animation.createThrottler(3000);

	//Настройки друзей
	protected relaysLevel = 1;
	protected friendsLevel = 1;
	protected friendsMaxCount = 3;

	protected healSpawnThrottler : AnimationThrottler = Animation.createThrottler(10000);

	//Настройки для отладки
	protected showAxis : boolean = false;
	protected showTimeCodes : boolean = false;
	protected showFps : boolean = true;
	protected showTechInfo : boolean = false;

	protected background : Background;
	protected ship : NormandyShip;
	protected sun : Sun;
	protected border : Border;
	protected asteroidBelt : AsteroidBelt;
	protected planets : PlanetWithOrbit[] = [];

	//Контейнеры с мобами
	protected enemiesContainer : MobsContainer<Enemy>;
	protected friendsContainer : MobsContainer<Mob>;
	protected relaysContainer : MobsContainer<FriendRelay>;

	//Контейры с атаками
	protected enemiesAttacks : AttacksContainer;
	protected friendsAttacks : AttacksContainer;

	//Контейнеры с дропом
	protected healsContainer : DropContainer<Healthy, Heal>;
	protected expContainer : DropContainer<Experienced, Experience>;

	//HTML-интерфейс
	protected shipHpIndicator : HpHtmlViewer;
	protected skillsIndicator : SkillsHtmlViewer;
	protected expIndicator : ExpHtmlViewer;
	protected fpsIndicator : FpsHtmlViewer;
	protected relaysIndicator : RelaysHtmlViewer;
	protected techInfoIndicator : TechInfoHtmlViewer;

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

		//Контейнеры с мобами
		this.friendsContainer = new MobsContainer<Mob>;
		this.enemiesContainer = new MobsContainer<Enemy>;
		this.relaysContainer = new MobsContainer<FriendRelay>;

		//Контейнеры с атаками
		this.enemiesAttacks = new AttacksContainer;
		this.friendsAttacks = new AttacksContainer;

		//Создаем корабль
		this.ship = new NormandyShip(this.friendsAttacks);

		//Контейнеры с дропом
		this.healsContainer = new DropContainer<Healthy, Heal>([this.ship]);
		this.expContainer   = new DropContainer<Experienced, Experience>([this.ship]);

		//HTML-интерфейс
		this.shipHpIndicator = new HpHtmlViewer(this.ship);
		this.expIndicator = new ExpHtmlViewer(this.ship);
		this.fpsIndicator = new FpsHtmlViewer(this);
		this.relaysIndicator = new RelaysHtmlViewer();
		this.techInfoIndicator = new TechInfoHtmlViewer()
			.addParam('Enemies Level', () => this.enemyLevel)
			.addParam('Enemies Spawned', () => this.enemySpawned)
			.addParam('Enemies Spawn Min', () => this.enemySpawnLimit)
			.addParam('Enemies Alive', () => this.enemiesContainer.getAliveMobs().length)
			.addParam('Relays level', () => this.relaysLevel);

		this.skillsIndicator = new SkillsHtmlViewer(this.ship)
			.addSkill('fire', 'SPACE', 'Space', true, this.skillFire)
			.addSkill('wave', 'Q', 'KeyQ', false, this.skillShockwave)
			.addSkill('rocket', 'E', 'KeyE', false, this.skillRocket)
			.addSkill('friend', 'F', 'KeyF', false, this.skillSpawnFriend)
			.addSkill('shield', 'G', 'KeyG', false, this.skillRelayShield)
			.addSkill('shield', 'Z', 'KeyZ', false, this.skillShield);


	}

	/**
	 * Инициализация игры
	 */
	public init(){

		this.initSkills();
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

			if(this.shipMovingAllow && (<HTMLElement>event.target).tagName !== 'BUTTON'){
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

		this.skillsIndicator.initListeners();

	}

	protected initSkills(){

		this.skillFire
			.setCooldown(100)
			.setCosts([100, 1000, 3000, 5000, 10000, 20000, 50000])
			.setOnUse(() => this.ship.fire())
			.setOnLevelUp(() => {
				this.ship.setFireLevel(this.ship.fireLevel + 1);
			})

		this.skillShockwave
			.setCooldown(5000)
			.setCosts([2000, 5000, 10000, 20000, 50000, 100000])
			.setOnUse(() => this.ship.shockwaveFire())
			.setOnLevelUp(() => {
				this.ship.setShockwaveLevel(this.ship.shockWaveLevel + 1);
			})

		this.skillRocket
			.setCooldown(20000)
			.setCosts([5000, 10000, 20000, 50000, 100000, 200000])
			.setEnabled(() => !!this.enemiesContainer.getAliveMobs().length)
			.setOnUse(() => this.ship.rocketFire(this.ship.whoNearest(this.enemiesContainer.getAliveMobs())!))
			.setOnLevelUp(() => {
				this.ship.setRocketLevel(this.ship.rocketLevel + 1);
			})

		this.skillSpawnFriend
			.setCooldown(5000)
			.setCosts([2000, 5000, 10000, 20000, 50000, 100000])
			.setMaxUses(() => this.friendsMaxCount)
			.setAvailableUses(() => this.friendsMaxCount - this.friendsContainer.getAliveMobs().length)
			.setOnUse(() => this.addFriend())
			.setOnLevelUp(() => {

				this.friendsLevel++
				this.friendsMaxCount = Math.min(this.friendsMaxCount + 1, 7);

				this.skillSpawnFriend.setMaxUses(this.friendsMaxCount);

			})

		this.skillRelayShield
			.setCooldown(90000)
			.setCosts([50000, 100000, 200000, 500000])
			.setOnUse(() => {
				this.relaysContainer.getAliveMobs().forEach(relay => relay.activateShield(10000))
			})
			.setOnLevelUp(() => {
				this.relaysLevel++;
				this.relaysContainer.getAliveMobs().forEach(relay => relay.upLevel())
			})

		this.skillShield
			.setCooldown(30000)
			.setCosts([10000, 20000, 30000, 50000])
			.setOnUse(() => this.ship.activateShield(this.ship.shieldLevel * 4000))
			.setOnLevelUp(() => {
				this.ship.setShieldLevel(this.ship.shieldLevel + 1);
			})

	}

	/**
	 * Добавление в DOM HTML-интерфейса
	 */
	protected initHtml(){

		document.body.appendChild(this.shipHpIndicator.element);
		document.body.appendChild(this.skillsIndicator.element);
		document.body.appendChild(this.expIndicator.element);
		document.body.appendChild(this.relaysIndicator.element);

		if(this.showFps){
			document.body.appendChild(this.fpsIndicator.element);
		}

		if(this.showTechInfo){
			document.body.appendChild(this.techInfoIndicator.element);
		}

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

		//Spawn relays
		this.addRelay('A', new Vector3(10, 10, 0))
		this.addRelay('B', new Vector3(20, -20, 0))
		this.addRelay('C', new Vector3(0, -60, 0))
		this.addRelay('D', new Vector3(-60, 10, 0))
		this.addRelay('E', new Vector3(50, 40, 0))
		this.addRelay('F', new Vector3(50, -50, 0))

		this.relaysIndicator.addRelays(
			...this.relaysContainer.getMobs()
		);

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
				// ...this.relaysContainer.getAliveMobs(),
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

	protected addRelay(letters : string, cords : Vector3){

		let relay = new FriendRelay(
			letters,
			1,
			this.friendsAttacks
		);

		relay.position.copy(cords.setZ(0));
		relay.rotateRelay(Math.random() * Math.PI * 2);

		this.relaysContainer.addMobs(relay);

	}

	/**
	 * Добавляем врага
	 */
	protected addEnemy(){

		let enemy = new EnemyReaper(
			this.enemyLevel,
			this.enemiesAttacks,
			this.healsContainer,
			this.expContainer
		);

		do{

			enemy.position.set(
				Random.int(-this.border.radius, this.border.radius),
				Random.int(-this.border.radius, this.border.radius),
				0
			)

		}while(enemy.position.distanceTo(this.ship.position) < 15);

		this.enemiesContainer.addMobs(enemy);

		this.enemySpawned++;

	}

	/**
	 * Добавляем врага
	 */
	protected addFriend(){

		let friend = new FriendHammerhead(
			this.friendsLevel,
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
				//Чтобы двигались за нашим кораблем
				friend.setAttackTarget(this.ship);
				friend.stopAutoFire();
			}else{
				friend.startAutoFire();
			}

		});

		this.friendsContainer.animate();

	}

	protected animateRelays(){
		this.relaysContainer.animate();
	}

	protected animateDrops(){
		this.healsContainer.animate();
		this.expContainer.animate();
	}

	protected analyzeWrap(code : string, fn : () => void, max : number = 10){

		let start = Date.now();

		fn();

		let end = Date.now(),
			time = (end - start);

		if(this.showTimeCodes){
			console.log('Время выполнения '  + code + ': ' + time + ' мс');
		}

		if(time > max){
			console.log('%c Долгое выполнение ' + code + ': ' + time + ' мс', 'color: orange');
		}

	}

	protected spawnRandomHeal(){

		let heal = new Heal(Math.ceil(this.ship.maxHealth / 15), 0.4);

		heal.position.x = Random.int(0, 1) ? Random.int(-40, -10) : Random.int(10, 40);
		heal.position.y = Random.int(0, 1) ? Random.int(-40, -10) : Random.int(10, 40);

		this.healsContainer.addDrop(heal);

	}

	/**
	 * То, что нужно обновлять по реже
	 */
	protected slowTick(){

		//Вывод фпс
		this.analyzeWrap('HTML_FPS', () => this.fpsIndicator.updateView());

		//Вывод тех информации
		this.analyzeWrap('HTML_TECH_INFO', () => this.techInfoIndicator.updateView());

		//Состояние ретрансляторов
		this.analyzeWrap('HTML_RELAYS_INFO', () => this.relaysIndicator.updateView());

		//Обновляем баланс
		this.analyzeWrap('HTML_SHIP_EXP', () => this.expIndicator.updateView());

		//Обновляем отображение здоровья
		this.analyzeWrap('HTML_SHIP_HP', () => this.shipHpIndicator.updateView());

		//Анимируем скиллы
		this.analyzeWrap('HTML_SHIP_SKILLS', () => this.skillsIndicator.updateView());

		//Спавн случайных аптечек
		this.healSpawnThrottler(() => this.spawnRandomHeal());

		//Добавляем врагов

		if(this.enemiesContainer.getAliveMobs().length < this.enemySpawnLimit){

			this.enemySpawnThrottler(() => {

				if(this.enemySpawned > 0 && !(this.enemySpawned % this.enemyKilledUpdateLevel)){
					this.ship.setHealthLevel(this.ship.healthLevel + 1);
					this.enemyLevel++;
					this.relaysLevel++;
					this.enemySpawnLimit = Math.min(this.enemySpawnLimit + 1, this.enemySpawnMaxCount);
					this.relaysContainer.getAliveMobs().forEach(relay => relay.upLevel());
				}

				this.addEnemy();

			});
		}

		//Конец игры если нас убили
		if(!this.ship.health){
			alert('Корабль уничтожен');
			this.stop();
			location.reload();
		}

		//Конец игры если ретрансляторы снесли
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
		this.analyzeWrap('SHIP_MOVING', () => {

			if (this.shipMovingAllow && this.shipMovingActive) {
				this.updateShipPosition();
				this.moveCameraToShip();
			}

		});

		//Отображаем название активной планеты
		this.analyzeWrap('PLANETS_ACTIVITY', () => {

			this.planets.forEach((planet : PlanetWithOrbit) => {

				planet.orbit.setActive(
					this.checkProximityToOrbit(planet.orbit!,  1.2)
				);

				planet.planet.setActive(
					this.checkProximityToPlanet(planet, 1.5)
				);

			});

		});

		//Анимируем солнце
		this.analyzeWrap('SUN_ANIMATION', () => this.sun.animate());

		//Анимируем двигатели корабля
		this.analyzeWrap('SHIP_ANIMATION', () => this.ship.animate());

		//Анимируем наши пули
		this.analyzeWrap('FRIENDS_ATTACKS_ANIMATION', () => this.animateFriendsAttacks());

		//Анимируем вражеские пули
		this.analyzeWrap('ENEMIES_ATTACKS_ANIMATION', () => this.animateEnemiesAttacks());

		//Анимируем действия врагов
		this.analyzeWrap('ENEMIES_MOVE_ANIMATION', () => this.animateEnemies());

		//Анимируем действия друзей
		this.analyzeWrap('FRIENDS_MOVE_ANIMATION', () => this.animateFriends());

		//Анимация ретрансляторов
		this.analyzeWrap('RELAYS_ANIMATION', () => this.animateRelays());

		//Анимация хилок
		this.analyzeWrap('DROP_ANIMATIONS', () => this.animateDrops());

	}

	public afterTick(){
	}

}