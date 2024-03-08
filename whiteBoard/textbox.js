export class TextBox{
	constructor (pos = {x:0, y:0}, text) {
		this.pos = pos;
		this.textarea = document.createElement('textarea');
		this.textarea.style.top = pos.y + "px";
		this.textarea.style.left = pos.x + "px";
		this.textarea.value = text ;
		this.textarea.style.fontSize = "35px";
		this.textarea.style.fontFamily = "Courier, monospace";
		this.textarea.style.backgroundColor = "transparent"
		this.textarea.style.color = "black";
		this.textarea.style.position = "absolute";
		this.textarea.style.zIndex = 1;
		this.textarea.style.border = "2px solid transparent";
		
		document.body.appendChild(this.textarea);
	
		this.textarea.addEventListener("mouseenter", (e) => {this.textarea.style.border = "2px solid blue"});
		this.textarea.addEventListener("mouseleave", (e) => {this.textarea.style.border = "2px solid transparent"});
	}
	
	translateBy(x,y){
		this.textarea.style.top = (this.pos.y + y) + "px";
		this.textarea.style.left = (this.pos.x + x) + "px";
		this.pos.x += x;
		this.pos.y += y;
	}

}