import { insideRect, Rect, rectRectOverlap, rectRectBoundingBox, findBoundBox } from "./bound.js";
import { preprocess } from "./preprocess.js";
import { Renderer } from "./renderer.js";
import { redrawAllStrokes, drawRect, drawStroke, drawCubicBezierSpline } from "./whiteboard.js";

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

		const scratchpad = document.createElement("canvas");
		const context = scratchpad.getContext("2d");
		
		if (!context){
			console.error("Cannot create canvas context");
			return
		}
		
		const strokesSelected = this.selectedStrokeIndices.map(i => {
			return strokes[i];
		});
		
		const [angle, pivot] = preprocess(strokesSelected);
		
		const rotateAbout = (point, angle, pivot)=>{
			let translated = {
				x: point.x - pivot.x, 
				y: point.y - pivot.y 
			};

			let rotated = {
				x: translated.x * Math.cos(angle) - translated.y * Math.sin(angle), 
				y: translated.x * Math.sin(angle) + translated.y * Math.cos(angle) 
			};

			let translatedBack = {
				x: rotated.x + pivot.x,
				y: rotated.y + pivot.y
			};
			return translatedBack;
		}

		// rotate strokes to somewhat align
		const rotatedStrokes = strokesSelected.map(stroke => {
			const p = stroke.points.map(point => {
				return rotateAbout(point, -angle, pivot);
			});
			return {
				points: p,
				bounds: findBoundBox(p),
				color: stroke.color,
				width: stroke.width,
				type: stroke.type
			}
		});

		// calculate bounding box of rotated strokes
		let bound = rotatedStrokes[0].bounds;
		for (let s of rotatedStrokes){
			bound = rectRectBoundingBox(bound, s.bounds);
		}

		const padding = 5;
		scratchpad.width = bound[1].x - bound[0].x + 2 * padding;
		scratchpad.height = bound[1].y - bound[0].y + 2 * padding;
		
		const r = new Renderer(scratchpad);
		r.clear("white");

		for (let s of rotatedStrokes){
			let localS = {
				points: s.points.map(p => {
					return {
						x: p.x - bound[0].x + padding,
						y: p.y - bound[0].y + padding
					};
				}),
				color: "black",
				width: s.width
			}
			if (s.type == "sp"){
				r.drawCubicBezierSpline(localS.points, localS.color, localS.width);
			}else{
				r.drawStroke(localS.points, localS.color, localS.width);
			}
		}
		let imageData = scratchpad.toDataURL('image/png');


		return imageData;

	}

	
	
}
