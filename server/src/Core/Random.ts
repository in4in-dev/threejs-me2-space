export default class Random
{

	public static int(min : number, max : number) : number
	{

		return Math.floor(
			min + Math.random() * (max + 1 - min)
		);

	}

	public static float(min : number, max : number) : number
	{
		return(min + Math.random() * (max - min));
	}

}