interface AnimationThrottler{
	(p: () => void) : void,
	getDelay() : number,
	getBeforeCall() : number,
	getAfterCall() : number
}

interface AnimationMemoSaver{
	fn : () => any,
	lastArgs : any[],
	lastResult : any
}

class Animation
{

	protected static memoContainer : AnimationMemoSaver[] = [];

	public static memo(fn : () => any, args : any[]){

		let search = this.memoContainer.find(item => item.fn === fn);

		if(!search){

			search = {
				fn,
				lastArgs : args.slice().map(() => {}),
				lastResult : null
			};

			this.memoContainer.push(search);

		}

		if(!args.every((a, i) => a === search.lastArgs[i])){
			search.lastResult = fn();
			search.lastArgs = args.slice();
		}

		return search.lastResult;

	}

	public static loop(n : number, callback : (...args : any[]) => any)
	{

		let animate = () => {
			n > 0 ? setTimeout(animate, n) : requestAnimationFrame(animate);
			callback();
		}

	}

	public static createThrottler(n : number, lastTime : number = 0) : AnimationThrottler
	{

		let fn = (fn : () => void) => {

			let now = Date.now();

			if(now - lastTime > n){
				lastTime = now;
				fn();
			}

		}

		Object.assign(fn, {
			getDelay(){
				return n;
			},
			getBeforeCall(){
				return Math.max(0, lastTime + n - Date.now());
			},
			getAfterCall(){
				return Date.now() - lastTime;
			}
		})

		return <AnimationThrottler>fn;

	}

}

export {Animation};
export type { AnimationThrottler };
