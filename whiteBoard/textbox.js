export class TextBox{
	constructor (pos = {x:0, y:0}) {
		this.pos = pos;
		this.textarea = document.createElement('textarea');
		// this.textarea.className = 'info';
		// let x = pos.x - canvas.offsetLeft,
    		// y = pos.y - canvas.offsetTop;
		this.textarea.style.top = pos.y + "px";
		this.textarea.style.left = pos.x + "px";
		this.textarea.value = "x:aaaaaaaaaaaaa" ;
		this.textarea.style.fontSize = 55;
		this.textarea.style.color = "red";
		this.textarea.style.zIndex = 1;
		document.body.appendChild(this.textarea);
	}

	draw(canvas, camera){
		canvas.font
		canvas.fillText()
	}

	// function mouseDownOnTextarea(e) {
	// 	var x = textarea.offsetLeft - e.clientX,
	// 		y = textarea.offsetTop - e.clientY;
	// 	function drag(e) {
	// 		textarea.style.left = e.clientX + x + 'px';
	// 		textarea.style.top = e.clientY + y + 'px';
	// 	}
	// 	function stopDrag() {
	// 		document.removeEventListener('mousemove', drag);
	// 		document.removeEventListener('mouseup', stopDrag);
	// 	}
	// 	document.addEventListener('mousemove', drag);
	// 	document.addEventListener('mouseup', stopDrag);
	// }
	// canvas.addEventListener('click', function(e) {
	// 	if (!textarea) {
			
	// 	}
	// 	var x = e.clientX - canvas.offsetLeft,
	// 		y = e.clientY - canvas.offsetTop;
	// 	textarea.style.top = e.clientY + 'px';
	// 	textarea.style.left = e.clientX + 'px';
	// }, false);​
}