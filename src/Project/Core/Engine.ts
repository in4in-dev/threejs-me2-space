import * as THREE from 'three';
import {WebGLRenderer} from "three";
//@ts-ignore
import {CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";
import * as TWEEN from '@tweenjs/tween.js';
import ModelLoader from "../../Three/ModelLoader";
import {Animation, AnimationThrottler} from "../../Three/Animation";
//@ts-ignore
import {CSS3DRenderer} from "three/examples/jsm/renderers/CSS3DRenderer";


export default abstract class Engine
{

	public camera : THREE.Camera;
	public scene : THREE.Scene;

	public webGLRenderer : WebGLRenderer;
	public css2DRenderer : CSS2DRenderer;
	public css3DRenderer : CSS3DRenderer;

	protected ticks : number = 0;
	protected ticksRender : number = 0;

	public fps : number = 0;
	public fpsRender : number = 0;

	protected active : boolean = false;

	protected slowTickThrottler : AnimationThrottler = Animation.createThrottler(50);

	constructor(element : HTMLElement) {


		let scene = new THREE.Scene();

		let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		let renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		element.appendChild(renderer.domElement);

		let css2DRenderer = new CSS2DRenderer();
		css2DRenderer.setSize(window.innerWidth, window.innerHeight);
		css2DRenderer.domElement.style.position = 'absolute';
		css2DRenderer.domElement.style.top = '0px';
		element.appendChild(css2DRenderer.domElement);

		let css3DRenderer = new CSS3DRenderer();
		css3DRenderer.setSize(window.innerWidth, window.innerHeight);
		css3DRenderer.domElement.style.position = 'absolute';
		css3DRenderer.domElement.style.top = '0px';
		element.appendChild(css3DRenderer.domElement);

		this.camera = camera;
		this.scene = scene;
		this.webGLRenderer = renderer;
		this.css3DRenderer = css3DRenderer;
		this.css2DRenderer = css2DRenderer;

	}

	protected abstract tick() : void;

	public stop(){
		this.active = false;
	}

	protected afterTick(){

	}

	protected slowTick(){

	}


	public run(){

		let animate = async () => {

			let startTime = Date.now(),
				tick =  ++this.ticks;

			if(this.active){
				ModelLoader.runBackgroundTasks();
			}

			this.tick();
			this.slowTickThrottler(() => this.slowTick());
			this.afterTick();

			//@TODO fps
			let renderTick = ++this.ticksRender;
			requestAnimationFrame(() => {

				if(this.ticksRender !== renderTick){
					return;
				}

				let renderStartTime = Date.now();

				this.webGLRenderer.render(this.scene, this.camera);
				this.css2DRenderer.render(this.scene, this.camera);
				this.css3DRenderer.render(this.scene, this.camera);

				this.fpsRender = Math.min(99999, Math.ceil(1 / ((Date.now() - renderStartTime) / 1000)));

			})

			this.fps = Math.min(99999, Math.ceil(1 / ((Date.now() - startTime) / 1000)));

			if(this.active) {
				requestAnimationFrame(animate);
				TWEEN.update();
			}

		}

		this.active = true;
		animate();

	}

}