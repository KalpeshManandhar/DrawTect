export class Renderer{
	constructor(canvas){
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
	}

	drawCubicBezierSpline(points, color, width){
		const nSegments = (points.length-1)/3;
		
		for (let i = 0; i<nSegments; i++){
			drawCubicBezier(points.slice(i*3, i*3+4), color, width);
		}
	}
	
	
	drawCubicBezier(points, color, width){
		this.context.save();
		
		this.context.beginPath();
		this.context.lineWidth = width;
		this.context.strokeStyle = `${color}`;
		
		this.context.moveTo(points[0].x, points[0].y);
		
		this.context.bezierCurveTo(
			points[1].x, points[1].y, 
			points[2].x, points[2].y, 
			points[3].x, points[3].y, 
		);
		
		this.context.stroke();
		this.context.closePath();
		this.context.restore();
	}

	
	// rect is [min, max]
	drawRect(rect, color, width=1){
		this.context.save();

		this.context.strokeStyle = `${color}`;
		this.context.lineWidth = width;

		this.context.beginPath();
		this.context.moveTo(rect[0].x, rect[0].y);
		this.context.lineTo(rect[0].x, rect[1].y);
		this.context.lineTo(rect[1].x, rect[1].y);
		this.context.lineTo(rect[1].x, rect[0].y);
		this.context.lineTo(rect[0].x, rect[0].y);
		this.context.stroke();
		this.context.closePath();

		this.context.restore();
  	}
	
}