// export const vscode = acquireVsCodeApi();
const vscodeInterface = acquireVsCodeApi();

export const vscode = {
	postMessage(m){
		vscodeInterface.postMessage(m);
	},

	setState(s){
		vscodeInterface.setState(s);
	},

	getState(){
		return vscodeInterface.getState();
	},

	toWebviewURI(path, callback){
		vscodeInterface.postMessage({
			type: "uri-change",
			path: path
		});
		// messages from extension to webview
		window.addEventListener('message', e => {
			const message = e.data;
			console.log("received messgae from exit")
		
			switch (message.type){
				case 'uri-change':{
					callback(message.data.path); 
				}
			}

			
		
		});
	}


}


