import * as THREE from 'three';
import {WebGLRenderer} from "three";
//@ts-ignore
import {CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";
import * as TWEEN from '@tweenjs/tween.js';


export default abstract class Engine
{

	public camera : THREE.Camera;
	public scene : THREE.Scene;

	public webGLRenderer : WebGLRenderer;
	public cssRenderer : CSS2DRenderer;

	protected active : boolean = false;

	constructor(element : HTMLElement) {


		let scene = new THREE.Scene();

		let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		let renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		element.appendChild(renderer.domElement);

		let labelRenderer = new CSS2DRenderer();
		labelRenderer.setSize(window.innerWidth, window.innerHeight);
		labelRenderer.domElement.style.position = 'absolute';
		labelRenderer.domElement.style.top = '0px';
		element.appendChild(labelRenderer.domElement);

		this.camera = camera;
		this.scene = scene;
		this.webGLRenderer = renderer;
		this.cssRenderer = labelRenderer;

	}

	protected abstract tick() : void;

	public stop(){
		this.active = false;
	}

	protected afterTick(){

	}

	public run(){

		let animate = async () => {

			if(this.active) {
				requestAnimationFrame(animate);
				TWEEN.update();
			}

			this.tick();

			this.webGLRenderer.render(this.scene, this.camera);
			this.cssRenderer.render(this.scene, this.camera);

			///
			this.afterTick();

		}

		this.active = true;
		animate();

	}

}