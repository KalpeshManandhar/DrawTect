import { vscode } from "./interface.js";

export class Img{
	constructor(imageSrc, srcType){
		this.src = imageSrc;
		this.pos = {x: 0, y: 0};
		this.ready = false;
		if (srcType == "blob"){
			this.image = new Image;
			this.image.src = imageSrc;
			this.ready = true;
		}
		else{
			vscode.toWebviewURI(imageSrc, (webviewUri) => {
				this.image = new Image;
				this.image.src = webviewUri;
				this.ready = true;
			})
		}
	}

	draw(context, camera){
		if (this.ready){
			const screenSpacePos = camera.toScreenSpace(this.pos);
			context.drawImage(this.image, screenSpacePos.x, screenSpacePos.y);
		}
	}
}