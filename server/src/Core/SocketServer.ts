import {Server} from "socket.io";
import {createServer} from "http";

export default abstract class SocketServer
{

	protected socket : Server;
	protected port : number;

	protected constructor(port : number) {

		let server = createServer();

		let socket = new Server(server, {
			path : '/',
			transports : ['websocket'],
			allowUpgrades : true,
			cors: {
				origin: "*"
			}
		});

		this.socket = socket;
		this.port = port;

		this.setEvents();

	}

	protected abstract setEvents() : void;

	public emitGlobal(action : string, response : any)
	{
		this.socket.emit(action, response);
	}

	public start(){
		this.socket.listen(this.port);
	}

}