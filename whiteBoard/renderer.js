export class Renderer{
	constructor(canvas){
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
	}

	drawCubicBezierSpline(points, color, width){
		const nSegments = (points.length-1)/3;
		if (nSegments == 0){
			return;
		}
		
		for (let i = 0; i<nSegments; i++){
			this.drawCubicBezier(points.slice(i*3, i*3+4), color, width);
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

	clear(color){
		this.context.save();
		this.context.fillStyle = `${color}`;
		this.context.fillRect(0,0, this.canvas.width, this.canvas.height);
		this.context.restore();
	}
	
	drawStroke(stroke, color, width){
		if (stroke.length == 0) 
		  return;
	  
		this.context.save();
		this.context.strokeStyle = `${color}`;
		this.context.lineWidth = width;
	  
		this.context.beginPath();
	  
		this.context.moveTo(stroke[0].x, stroke[0].y);
	  
		for (let point of stroke){
		  this.context.lineTo(point.x, point.y);
		}
		this.context.stroke();
		this.context.restore();
	  
	}

}