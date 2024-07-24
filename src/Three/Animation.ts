export default class Animation
{

	public static loop(n : number, callback : (...args : any[]) => any)
	{

		let animate = () => {
			n > 0 ? setTimeout(animate, n) : requestAnimationFrame(animate);
			callback();
		}

	}

	public static createThrottler(n : number, lastTime : number = 0){

		return (fn : () => void) => {

			let now = Date.now();

			if(now - lastTime > n){
				lastTime = now;
				fn();
			}

		}

	}

}