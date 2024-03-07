import { Rect, rectRectOverlap } from "./bound.js";
import { redrawAllStrokes, drawRect } from "./whiteboard.js";

class eraser{

	constructor(){
		
		this.isSelected = false;
		this.isSelecting = false;
		this.removeIndex = [];
		this.erase = false;

		this.selectedStrokeIndices = [];

		this.startPos = {};
		this.prevPos = {};
	}

	startErasing (startPos){

		this.selectedStrokeIndices = [];
		this.isSelecting = true;

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
	}

	eraseStrokes( strokes){

		
		for (let selectedIndex of this.selectedStrokeIndices){
			
			for (let i = 0; i<strokes[selectedIndex].points.length; i++){
				strokes[selectedIndex].points[i] = null;
			}

			strokes.splice(selectedIndex, 1);
			this.removeIndex.push(selectedIndex);
			console.log("erased indices ", this.removeIndex);
			redrawAllStrokes();
		}

		this.selectedStrokeIndices = [];
		
	}

	eraseSelected( strokes, currentPos, camera){

		if (this.isSelecting){
			this.select(strokes, currentPos, camera);
			this.erase = true;
		}
		else if(this.erase){
			this.eraseStrokes(strokes);
		}
		this.prevPos = {x: currentPos.x, y: currentPos.y};
	}

	end (){

		if (this.isSelecting){

			this.isSelecting = false;

			redrawAllStrokes();

			if (this.selectedStrokeIndices.length == 0){
				this.erase = false;
			}
			return [];
		}
		else if (this.erase){
			this.erase = false;

			return this.removeIndex;
		}
	}

}

export default eraser;