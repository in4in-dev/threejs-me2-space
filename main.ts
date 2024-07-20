import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import {CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";
import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";
import {AdditiveBlending, MultiplyBlending, NoBlending} from "three/src/constants";
import MeshBasicTextureMaterial from "./src/Three/MeshBasicTextureMaterial";

// Создание сцены
const scene = new THREE.Scene();

// Создание камеры
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 20);
camera.lookAt(0, 0, 0);

// Создание рендерера
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Создание CSS2DRenderer для текстовых меток
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

// Добавление осей X, Y, Z
const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

// Создание фона космоса с параллакс-эффектом
function createSpaceBackground() {

	// Загрузка текстуры космоса
	const spaceTexture = new THREE.TextureLoader().load('space_texture.jpg');

	const spaceMaterial = new MeshBasicTextureMaterial(spaceTexture, 0.7);

	const spaceGeometry = new THREE.SphereGeometry(100, 14, 14); // Большая сфера, окружающая сцену
	const spaceBackground = new THREE.Mesh(spaceGeometry, spaceMaterial);
	spaceBackground.rotation.x = 3000;
	spaceBackground.rotation.z = 300;
	spaceBackground.rotation.y = 300;
	scene.add(spaceBackground);
}

// Создание фона космоса
createSpaceBackground();

// Функция для создания корабля
function createShip() {
	const shipGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
	const shipMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	const ship = new THREE.Mesh(shipGeometry, shipMaterial);

	ship.userData = {controlEnabled : true}

	// Поворот корабля в вертикальное положение
	// ship.rotation.z = Math.PI;

	// Создание ребер для корабля
	const edges = new THREE.EdgesGeometry(shipGeometry);
	const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
	const shipLine = new THREE.LineSegments(edges, edgesMaterial);

	ship.add(shipLine);
	return ship;
}

// Создание корабля
const ship = createShip();
scene.add(ship);

// Массив для хранения планет и орбит
const planets = [];
const orbits = [];

function createSun(){

	// Создание материала для солнца
	const sunMaterial = new THREE.MeshBasicMaterial({ color : 'yellow' });

	const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
	const sun = new THREE.Mesh(sunGeometry, sunMaterial);
	scene.add(sun);

	const sunLight = new THREE.PointLight('white', 500, 10000); // Цвет, интенсивность и дистанция освещения
	sunLight.position.set(0, 0, 0); // Положение в центре сцены (где солнце должно быть)
	scene.add(sunLight);

}

createSun();

// Функция для создания планеты и орбиты
function createPlanet(radius : number, orbitRadius : number, color: number, name : string, texture : string) {

	const planetTexturre = new THREE.TextureLoader().load(texture);
	const planetMaterial = new THREE.MeshLambertMaterial({ map: planetTexturre });

	const planet = new THREE.Mesh(
		new THREE.SphereGeometry(radius, 200, 200),
		planetMaterial
	);

	planet.userData = { name: name, isActive: false }; // Добавляем информацию о планете

	const angle = Math.random() * 2 * Math.PI;

	planet.position.set(orbitRadius * Math.cos(angle), orbitRadius * Math.sin(angle), 0);

	// Создание орбиты
	/**
	const orbitGeom = new THREE.CircleGeometry(orbitRadius, 64);
	const positions = orbitGeom.attributes.position.array;
	const orbitVertices = [];
	for (let i = 3; i < positions.length; i += 3) {
		orbitVertices.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
	}
	const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x1e395c, linewidth : 50 });
	const orbit = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(orbitVertices), orbitMaterial);
	// orbit.rotation.x = Math.PI / 2; // Повернуть орбиту в плоскость XY
	scene.add(orbit);
	orbits.push({ orbit, radius: orbitRadius });

**/
	createOrbit(orbitRadius, 0x1e395c, 0.05);

	// Создание метки для планеты
	const div = document.createElement('div');
	div.className = 'label';
	div.textContent = name;
	div.style.marginLeft = name.length * 5 + 'px';

	const label = new CSS2DObject(div);
	label.position.set(0, radius + 2, 0); // Расположение метки над планетой
	planet.add(label);

	scene.add(planet);

	planets.push(planet);
}

function createOrbit(radius, color, thickness) {

	// Создание кривой эллипса для орбиты
	const curve = new THREE.EllipseCurve(
		0, 0,            // ax, aY
		radius, radius,  // xRadius, yRadius
		0, 2 * Math.PI,  // aStartAngle, aEndAngle
		false,           // aClockwise
		0                // aRotation
	);

	// Получение точек из кривой
	const points = curve.getPoints(64);

	// Создание кривой из точек
	const curvePath = new THREE.CurvePath();
	curvePath.add(new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(point.x, 0, point.y))));

	// Создание трубчатой геометрии
	const tubeGeometry = new THREE.TubeGeometry(curvePath, 100, thickness, 8, true);

	const material = new THREE.MeshBasicMaterial({ color: color });
	const mesh = new THREE.Mesh(tubeGeometry, material);

	mesh.rotation.x = Math.PI / 2; // Поворот орбиты, чтобы она лежала в плоскости XZ

	scene.add(mesh);

	orbits.push({ orbit : mesh, radius });

}

// Создание нескольких планет и орбит
let names = ["Сухов Владислав", 'Жопа полная', "Сюда не лети", "Очко", "Рай", "Гуся", "Курицы", "Больница"];
let textures = ["planets/1.png", "planets/2.png", "planets/3.png", "planets/4.png", "planets/5.png", "planets/6.png", "planets/7.png", "planets/8.png"];
for(let i = 0, planetRadius = 0, planetsCount =  THREE.MathUtils.randInt(4, 8); i < planetsCount; i++){
	planetRadius += THREE.MathUtils.randInt(5, 10);
	createPlanet(THREE.MathUtils.randFloat(0.2, 1.5), planetRadius, 0xffffff, names[i], textures[i]);
}

// Переменные для хранения положения мыши и целевой позиции корабля
const mouse = new THREE.Vector2();
const targetPosition = new THREE.Vector3(); // Инициализация целевой позиции
const speed = 0.1; // Скорость перемещения корабля
let isMousePressed = false;

// Обработчик события движения мыши
function onMouseMove(event) {
	if (isMousePressed) {
		// Обновление координат мыши
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		// Обновление raycaster и нахождение пересечения с плоскостью
		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, camera);

		// Ограничение перемещения корабля в плоскости XY
		const plane = new THREE.Plane(new THREE.Vector3(0,0,1), 0);
		const intersection = new THREE.Vector3(0, 0, 0);
		raycaster.ray.intersectPlane(plane, intersection);

		targetPosition.x = intersection.x;
		targetPosition.z = intersection.z;
		targetPosition.y = intersection.y;
	}
}

function onDoubleClick(event) {

	// Обновление raycaster и нахождение пересечения с плоскостью
	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse, camera);

	// Определение пересечений с объектами
	const intersects = raycaster.intersectObjects(planets);

	// Если есть пересечение, обработка двойного клика на планете
	if (intersects.length > 0) {
		const planet = intersects[0].object;
		// if (planet.userData.isActive) {
			moveCameraToPlanet(planet);
		// }
	}
}

// Обработчик события нажатия мыши
function onMouseDown(event) {
	isMousePressed = true;

	onMouseMove(event);
}

// Обработчик события отпускания мыши
function onMouseUp(event) {
	isMousePressed = false;

	targetPosition.x = ship.position.x;
	targetPosition.y = ship.position.y;
	targetPosition.z = ship.position.z;
}

// Добавление обработчиков событий
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('dblclick', onDoubleClick, false);
window.addEventListener('mouseup', onMouseUp, false);

function checkProximityToOrbit(ship, orbitRadius, proximityDistance) {
	const distanceToOrbit = ship.position.distanceTo(new THREE.Vector3(0, 0, 0));
	return Math.abs(distanceToOrbit - orbitRadius) < proximityDistance;
}

// Функция для проверки близости корабля к планете
function checkProximityToPlanet(ship, planet, proximityDistance) {
	const distance = ship.position.distanceTo(planet.position);
	return distance < proximityDistance;
}

function moveCameraToPlanet(planet) {
	// Отключение управления кораблем
	ship.userData.controlEnabled = false;

	// Текущая позиция камеры
	const currentPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };

	// Текущая ориентация камеры
	const currentQuaternion = camera.quaternion.clone();

	// Направление к планете
	const direction = new THREE.Vector3();
	direction.subVectors(planet.position, camera.position).normalize();

	// Целевая позиция камеры (ближе к планете)
	const targetPos = planet.position.clone().sub(direction.multiplyScalar(3)); // Уменьшите значение по мере необходимости для большего приближения

	// Анимация перехода камеры с использованием TWEEN.js
	new TWEEN.Tween(currentPos)
		.to({ x: targetPos.x, y: targetPos.y, z: targetPos.z }, 2000) // Длительность анимации 2 секунды
		.easing(TWEEN.Easing.Quadratic.InOut) // Плавность анимации
		.onUpdate(() => {
			camera.position.set(currentPos.x, currentPos.y, currentPos.z);
			camera.quaternion.copy(currentQuaternion); // Устанавливаем ориентацию камеры
		})
		.onComplete(() => {
		})
		.start();
}

// Анимационная функция
function animate() {
	requestAnimationFrame(animate);

	// Обновление TWEEN.js
	TWEEN.update();

	if (ship.userData.controlEnabled !== false) {
		// Плавное перемещение корабля к целевой позиции
		const direction = new THREE.Vector3().subVectors(targetPosition, ship.position);
		if (direction.length() > 0.1) {
			direction.normalize()
			ship.position.add(direction.multiplyScalar(speed));

			// Вычислить угол поворота
			const angle = Math.atan2(direction.y, direction.x);
			ship.rotation.z = angle + -Math.PI / 2; // Повернуть корабль

		}

		// Перемещение камеры за кораблем
		camera.position.x = ship.position.x;
		camera.position.y = ship.position.y - 15; // Камера будет находиться ниже корабля
		camera.position.z = ship.position.z + 10; // Камера будет находиться позади корабля
		camera.lookAt(ship.position.clone().setZ(0)); // Убедитесь, что камера смотрит на плоскость XY

	}

	// Проверка близости корабля к орбитам
	orbits.forEach(({ orbit, radius }, index) => {
		if (checkProximityToOrbit(ship, radius,  1.2)) {
			orbit.material.color.set(0xff0000); // Изменение цвета орбиты на красный при близости
		} else {
			orbit.material.color.set('#2c63ab'); // Возвращение цвета орбиты на синий, если корабль удаляется
		}
		// Проверка близости корабля к планетам
		if (checkProximityToPlanet(ship, planets[index], 1.2)) { // Установите нужное расстояние
			planets[index].material.color.set(0xff0000); // Изменение цвета планеты на красный при близости
			planets[index].children[0].element.style.opacity = '1'; // Показываем метку
			planets[index].userData.isActive = true;
		} else {
			planets[index].material.color.set(0xffffff); // Возвращение цвета планеты на исходный, если корабль удаляется
			planets[index].children[0].element.style.opacity = '0'; // Скрываем метку
			planets[index].userData.isActive = false;
		}
	});

	// Рендеринг сцены
	renderer.render(scene, camera);
	labelRenderer.render(scene, camera);
}

// Запуск анимации
animate();
