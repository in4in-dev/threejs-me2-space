import Engine from "./Engine";
import * as THREE from "three";
import Ship from "./Ship";
import Sun from "./Sun";
import Planet from "./Planet";
import Background from "./Background.ts";
import Orbit from "./Orbit.ts";
import Belt from "./Belt.ts";

export default class Game extends Engine
{

	protected shipMovingAllow : boolean = true;
	protected shipMovingActive : boolean = false;
	protected shipMovingTarget : any = null;

	protected mousePositionX : number = 0;
	protected mousePositionY : number = 0;

	protected background : Background;
	protected ship : Ship;
	protected sun : Sun;
	protected belt : Belt;
	protected planets : Planet[] = [];

	constructor() {

		super(document.body);

		this.background = new Background('../../space_texture.jpg');
		this.ship = new Ship();


		//////////////////////
		// Создание солнца

		let glows = [ '#fed36a', 'blue', 'pink', '#a63737', '#d0652c'];
		this.sun = new Sun(
			THREE.MathUtils.randFloat(0.4, 4),
			500,
			'white',
			glows[THREE.MathUtils.randInt(0, glows.length)]
		);

		this.belt = new Belt(
			THREE.MathUtils.randInt(5, 40),
			THREE.MathUtils.randFloat(0.4, 1.5)
		);

		/////////////////////
		// Создание нескольких планет и орбит
		let planetNames = ["Сухов Владислав", 'Жопа полная', "Сюда не лети", "Очко", "Рай", "Гуся", "Курицы", "Больница"];
		let planetTextures = ["planets/1.png", "planets/2.png", "planets/3.png", "planets/4.png", "planets/5.png", "planets/6.png", "planets/7.png", "planets/8.png"];

		for(let i = 0, planetRadius = 0, planetsCount =  THREE.MathUtils.randInt(4, 8); i < planetsCount; i++){

			planetRadius += THREE.MathUtils.randInt(5, 10);

			this.planets.push(
				new Planet(THREE.MathUtils.randFloat(0.2, 1.5), planetRadius, planetNames[i], planetTextures[i])
			);

		}

	}

	public async init(){
		await this.ship.load();

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
				this.shipMovingTarget = this.ship.mesh!.position;
				this.ship.stopEngines();
			}

		});

	}

	protected initScene(){

		this.belt.addToScene(this.scene);
		this.ship.addToScene(this.scene);
		this.sun.addToScene(this.scene);
		this.background.addToScene(this.scene);

		this.planets.forEach(planet => planet.addToScene(this.scene));

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

		let distance = this.ship.mesh!.position.distanceTo(planet.mesh.position);

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

	protected tick(){

		if (this.shipMovingAllow && this.shipMovingActive) {

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

			this.shipMovingTarget = intersection;

		}

		//Движение корабля
		if(this.shipMovingAllow && this.shipMovingTarget){

			this.ship.moveTo(this.shipMovingTarget);

			this.moveCameraToShip();

		}

		this.planets.forEach((planet : Planet) => {

			planet.orbit.setActive(
				this.checkProximityToOrbit(planet.orbit,  1.2)
			);

			planet.setActive(
				this.checkProximityToPlanet(planet, 1.2)
			);

		});

		this.sun.animateSparks();
		this.ship.animateEngines();
		this.belt.animateCollision(this.ship.mesh!);

	}

}