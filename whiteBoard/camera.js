//dt: camera
export class Camera2D{
	constructor (w, h, pos){
		this.screenW = w;
		this.screenH = h;
		this.pos = pos;
		this.zoom = 1;
		
	}
	//dt: setscreen
	toScreenSpace(point){
		let res = {x: point.x, y: point.y};

		// translate
		res.x -= this.pos.x;
		res.y -= this.pos.y;

		return res;
//dt: hello
	}
	
	toWorldSpace(point){
		let res = {x: point.x, y: point.y};

		// translate
		res.x += this.pos.x;
		res.y += this.pos.y;

		return res;

	}
}