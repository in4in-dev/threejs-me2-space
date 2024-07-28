import Component from "../Core/Component";
import * as THREE from 'three';
import Mob from "../Components/Mob";


export default class MobsContainer<M extends Mob = Mob> extends Component
{

	protected mobs : M[] = [];

	public constructor() {
		super();
	}

	public addMobs(...mob : M[]) : void{
		this.mobs.push(...mob);
		this.add(...mob);
	}

	public getMobs() : M[]
	{
		return this.mobs.slice();
	}

	public getAliveMobs() : M[]
	{
		return this.mobs.filter(mob => mob.health > 0);
	}

	protected clearDiedMobs() : void
	{
		this.mobs = this.mobs.filter(mob => {

			if(mob.isVisible){
				return true;
			}

			this.remove(mob);
			return false;

		})
	}

	public animate() : void
	{

		this.clearDiedMobs();

	}

}