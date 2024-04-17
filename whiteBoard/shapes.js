//shapes drawer

import {context} from "./whiteboard.js";


class drawShapes{

	strokeRectangle(e, prevMousePosX, prevMousePosY, cameraX, cameraY) {

		let tempX = e.clientX;
        let tempY = e.clientY;
		let strokeStack = [];

		this.drawRectangle(e, prevMousePosX, prevMousePosY);

        strokeStack = [
            { x: prevMousePosX + cameraX, y: prevMousePosY + cameraY},
            { x: tempX + cameraX, y: prevMousePosY + cameraY},
            { x: tempX + cameraX, y: tempY + cameraY},
            { x: prevMousePosX + cameraX, y: tempY + cameraY},
            { x: prevMousePosX + cameraX, y: prevMousePosY + cameraY}
        ];
        context.stroke();

        return strokeStack;
    }

	strokeDiamond(e, prevMousePosX, prevMousePosY, cameraX, cameraY){
		let tempX = e.clientX;
		let tempY = e.clientY;
		let strokeStack = [];

		this.drawDiamond(e, prevMousePosX, prevMousePosY);


		strokeStack = [
			{ x: prevMousePosX + (( tempX - prevMousePosX )/2) + cameraX, y: prevMousePosY + cameraY},
			{ x: tempX + cameraX, y: prevMousePosY + ((tempY - prevMousePosY)/2) + cameraY},
			{ x: tempX - ((tempX - prevMousePosX)/2) + cameraX, y: tempY  + cameraY},
			{ x: prevMousePosX + cameraX, y: (prevMousePosY + tempY)/2  + cameraY},
			{x: prevMousePosX + (( tempX - prevMousePosX )/2) + cameraX, y: prevMousePosY  + cameraY}
		];
		context.stroke();

		return strokeStack;
	}

	strokeCircle(e, prevMousePosX, prevMousePosY){
		let tempX = e.clientX;
		let tempY = e.clientY;
	
		let centerX = prevMousePosX + ((tempX - prevMousePosX)/2);
		let centerY = prevMousePosY + ((tempY - prevMousePosY)/2);
		
		let strokeStack = [];

		let radius = (tempX - prevMousePosX)/2;
	
		let numPoints = 200;
	
		const angleIncrement = (2 * Math.PI) / numPoints; 
		let x,y;
		context.beginPath();
		for (let i = 0; i < numPoints; i++) {
			const angle = i * angleIncrement; 
			x = centerX + radius * Math.cos(angle); 
			y = centerY + radius * Math.sin(angle); 
			context.lineTo(x,y);
			context.closePath;
			strokeStack.push({x,y});
		}
		
		//context.fillStyle = 'lightblue';
		//context.fill();
		context.stroke();

		return radius;
	}

	getFinalCircle(e,radius, centerX, centerY,numPoints=200, cameraX, cameraY){
		let x,y;
		context.beginPath();
		let strokeStack = [];
		const angleIncrement = (2 * Math.PI) / numPoints; 

		for (let i = 0; i < numPoints; i++) {
			const angle = i * angleIncrement; 
			x = centerX + cameraX + radius * Math.cos(angle); 
			y = centerY + cameraY + radius * Math.sin(angle); 
			context.lineTo(x,y);
			context.closePath;
			strokeStack.push({x,y});
		}
		return strokeStack;
	}

	drawRectangle = (e, prevMousePosX, prevMousePosY) => {
		// if(!fillColor.checked){
		// return context.strokeRect(e.offsetX, e.offsetY, prevMousePosX - e.offsetX, prevMousePosY - e.offsetY);
		// }
		// context.fillRect(e.offsetX, e.offsetY, prevMousePosX - e.offsetX, prevMousePosY - e.offsetY);

		return context.strokeRect(e.clientX, e.clientY, prevMousePosX - e.clientX, prevMousePosY - e.clientY);
	};
	
	drawDiamond = (e, prevMousePosX, prevMousePosY) => {
		const size = Math.min(Math.abs(prevMousePosX - e.clientX), Math.abs(prevMousePosY - e.clientY));
		const centerX = (prevMousePosX + e.clientX) /2;
		const centerY = (prevMousePosY + e.clientY) /2;
		// current transformation state
		context.save();
	
		// trandlating the canvas to the center of the rectangle
		context.translate(centerX, centerY);
	
		// rotating the canvas by 45 degrees
		context.rotate((45 * Math.PI) /180);
		// if(fillColor.checked){
		// context.fillRect(-size /2, -size /2, size, size);
		// }
		// drawing the rectangle wit rotated coordinates
		context.strokeRect(-size /2, -size /2, size, size);
	
		// restoring the canvas
		context.restore();
	
		};
	
	drawCircle = (e, prevMousePosX, prevMousePosY, fillColor) => {
			context.beginPath();
			
			let radius = Math.sqrt(Math.pow((prevMousePosX - e.offsetX), 2) + Math.pow((prevMousePosY - e.offsetY),2));
			context.arc(prevMousePosX, prevMousePosY, radius, 0, 2 * Math.PI);
			
			fillColor.checked ? context.fill() : context.stroke();
			context.stroke();
			context.closePath();
			context.beginPath();
		};
}

export default drawShapes;