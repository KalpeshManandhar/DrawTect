import { insideRect, Rect, rectRectOverlap, rectRectBoundingBox } from "./bound.js";
import { Renderer } from "./renderer.js";
import { redrawAllStrokes, drawRect, drawCubicBezierSpline, drawStroke} from "./whiteboard.js";

export class SelectTool{
	constructor(){
		this.isSelected = false;
		this.moving = false;
		this.isSelecting = false;
		this.selectedStrokeIndices = []
		this.combinedBoundingBoxSS = undefined

		this.startPos = {};
		this.prevPos = {};
	}

	start(startPos){
		// if something is selected and clicked on it
		if (this.isSelected && insideRect(startPos, this.combinedBoundingBoxSS)){
			// move the current one
			this.moving = true;
		}
		// start new selection
		else {
			this.selectedStrokeIndices = [];
			this.isSelecting = true;
		}
		this.startPos = {x:startPos.x, y:startPos.y};
		this.prevPos =  {x:startPos.x, y:startPos.y};
	}

	select(strokes, currentPos, camera){
		const selectBounds = Rect(this.startPos, {x: currentPos.x, y: currentPos.y});
		const selectBoundsWS = [
			camera.toWorldSpace(selectBounds[0]), 
			camera.toWorldSpace(selectBounds[1])
		];
		
		this.selectedStrokeIndices = [];
		
		redrawAllStrokes();
		for (let strokeIndex in strokes){
			if (rectRectOverlap(selectBoundsWS, strokes[strokeIndex].bounds)){
				const bound = strokes[strokeIndex].bounds;
				const strokeBoundsSS = [
					camera.toScreenSpace(bound[0]), 
					camera.toScreenSpace(bound[1])
				];  
				drawRect(strokeBoundsSS, "blue", 1);
				this.selectedStrokeIndices.push(strokeIndex);
			} 
		}
		
		drawRect(selectBounds, "black", 1);
	}

	moveStrokes(strokes, currentPos, camera){
		const movementDir = {
			x: (currentPos.x - this.prevPos.x),
			y: (currentPos.y - this.prevPos.y)
		}


		redrawAllStrokes();

		for (let selectedIndex of this.selectedStrokeIndices){
			strokes[selectedIndex].bounds[0].x += movementDir.x;
			strokes[selectedIndex].bounds[0].y += movementDir.y;
			strokes[selectedIndex].bounds[1].x += movementDir.x;
			strokes[selectedIndex].bounds[1].y += movementDir.y;

			
			for (let i = 0; i<strokes[selectedIndex].points.length; i++){
				strokes[selectedIndex].points[i].x += movementDir.x;
				strokes[selectedIndex].points[i].y += movementDir.y;
			}
			
			const bound = strokes[selectedIndex].bounds;
			const strokeBoundsSS = [
				camera.toScreenSpace(bound[0]), 
				camera.toScreenSpace(bound[1])
			];  

			drawRect(strokeBoundsSS, "blue", 1);
		}		

		this.combinedBoundingBoxSS[0].x += movementDir.x; 
		this.combinedBoundingBoxSS[0].y += movementDir.y; 
		this.combinedBoundingBoxSS[1].x += movementDir.x; 
		this.combinedBoundingBoxSS[1].y += movementDir.y; 

		drawRect(this.combinedBoundingBoxSS, "blue", 1);

	}


	cursorMove(strokes, currentPos, camera){
		if (this.isSelecting){
			this.select(strokes, currentPos, camera);
		}
		else if (this.moving){
			this.moveStrokes(strokes, currentPos, camera);
		}
		this.prevPos = {x: currentPos.x, y: currentPos.y}
	}

	end(strokes, camera){
		if (this.isSelecting){
			this.isSelecting = false;
			
			redrawAllStrokes();
		
			if (this.selectedStrokeIndices.length == 0){
			  	this.isSelected = false;
			 	return [];
			}
		
			this.combinedBoundingBoxSS = [
				camera.toScreenSpace(strokes[this.selectedStrokeIndices[0]].bounds[0]), 
				camera.toScreenSpace(strokes[this.selectedStrokeIndices[0]].bounds[1])
			];
		
			for (let selectedIndex of this.selectedStrokeIndices){
				const strokeBoundsSS = [
					camera.toScreenSpace(strokes[selectedIndex].bounds[0]), 
					camera.toScreenSpace(strokes[selectedIndex].bounds[1])
				];  
				drawRect(strokeBoundsSS, "blue", 1);
				
				this.combinedBoundingBoxSS = rectRectBoundingBox(strokeBoundsSS, this.combinedBoundingBoxSS);  
			}
			drawRect(this.combinedBoundingBoxSS, "blue", 1);

			this.isSelected = true;

			return []
		}
		else if (this.moving){
			this.moving = false;
			return this.selectedStrokeIndices.map(index => {
				let a = {
					...strokes[index]	
				};
				delete a.bounds;
				return {index: index, stroke: a};
			})		
		}
	}

	getStrokesImage(strokes){
		if (!this.isSelected){
			console.error("Nothing selected");
			return;
		}

		// const scratchpad = document.createElement("canvas");
		const scratchpad = document.getElementById("whiteboard")
		const context = scratchpad.getContext("2d");
		
		if (!context){
			console.error("Cannot create canvas context");
			return
		}
		
		const padding = 5;
		scratchpad.width = this.combinedBoundingBoxSS[1].x - this.combinedBoundingBoxSS[0].x + 2 * padding;
		scratchpad.height = this.combinedBoundingBoxSS[1].y - this.combinedBoundingBoxSS[0].y + 2 * padding;
		
		const r = new Renderer(scratchpad);

		for (let index of this.selectedStrokeIndices){
			let s = strokes[index];
			let localS = {
				points: s.points.map(p => {
					return {
						x: p.x - this.combinedBoundingBoxSS[0].x + padding,
						y: p.y - this.combinedBoundingBoxSS[0].y + padding
					};
				}),
				color: s.color,
				width: s.width
			}
			if (s.type == "sp"){
				r.drawCubicBezierSpline(localS.points, localS.color, localS.width);
			}else{
				r.drawStroke(localS.points, localS.color, localS.width);
			}
		}
		let imageData = scratchpad.toDataURL('image/png');
		// Append an image element to the body to display the canvas image
		const imgElement = document.createElement('img');
		imgElement.src = imageData;
		document.body.appendChild(imgElement);

		return imageData;

	}

	
	
}
