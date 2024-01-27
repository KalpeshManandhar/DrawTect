import * as vscode from 'vscode';
import * as fs from "fs";

import {EXTENSION_COMMANDS, WHITEBOARD_FOLDER} from './defines'

interface DT_DocumentEdit{

}



export class DT_EditorProvider implements vscode.CustomTextEditorProvider {
    constructor(
		private readonly context: vscode.ExtensionContext
	) {}

    static viewType = 'DrawTect.draw';


    public static testCommand(): boolean{
        console.log("Test command executed");
        return true
    }

    public static async openFileCommand(relativePath: string){
        if (!relativePath){
            console.error("No file opened");
            return;
        }

        const workspaces = vscode.workspace.workspaceFolders;
        if (!workspaces){
            console.error("No workspace opened");
            return;
        }

        const baseUri = workspaces[0].uri;
        const filePath = `${baseUri.fsPath}/${relativePath}`

        if (!fs.existsSync(filePath)){
            console.error(`${filePath} doesn't seem to exist.`)
            return;
        }

        await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(filePath));
        console.log(`[DRAWTECT] File ${filePath} opened`);
        console.log("Test open command executed");
        return true;
    }




    public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new DT_EditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(DT_EditorProvider.viewType, provider);
        vscode.commands.registerCommand(EXTENSION_COMMANDS.test, this.testCommand);
        vscode.commands.registerCommand(EXTENSION_COMMANDS.open, this.openFileCommand);
        
        return providerRegistration;
	}


    resolveCustomTextEditor(document: vscode.TextDocument, 
                            webviewPanel: vscode.WebviewPanel, 
                            token: vscode.CancellationToken
    ): Thenable<void> | void{

        webviewPanel.webview.options = {
            enableScripts: true,
        };
        
        const whiteboardDir = `${this.context.extensionUri.fsPath}/${WHITEBOARD_FOLDER}`;
        webviewPanel.webview.html = this.loadHtmlAsWebviewResource(webviewPanel.webview, whiteboardDir, "whiteboard.html");

        console.log(document);
        
        vscode.workspace.onDidChangeTextDocument(e => {
            // if the document with the changes is the same as this document
            if (e.document.uri.toString() === document.uri.toString()){
                // update webview 
            }
        })

        // receive message from webview
        webviewPanel.webview.onDidReceiveMessage((e) => {
            
        })


    }


    loadHtmlAsWebviewResource(webview: vscode.Webview, baseDir: string, htmlFile: string): string{
        const fullHtmlPath = `${baseDir}/${htmlFile}`;
        let str = fs.readFileSync(fullHtmlPath, 'utf-8');
    
        const scriptRegex = /<script [\w*\W*\s]*src\s*=\s*"([\\*/*.*\w*]*)">/;
        const scriptSources = str.match(scriptRegex);
    
        if (scriptSources){
            for (let i = 1; i< scriptSources.length; i++){	
                const fileUri = vscode.Uri.file(`${baseDir}/${scriptSources[i]}`)
                const fileWebviewUri = webview.asWebviewUri(fileUri);
                str = str.replace(scriptSources[i], fileWebviewUri.toString());
            }
        }
        
        const linkRegex = /<link [\w*\W*\s]*href\s*=\s*"([\\*/*.*\w*]*)">/;
        const linkSources = str.match(linkRegex);
    
        if (linkSources){
            for (let i = 1; i< linkSources.length; i++){	
                const fileUri = vscode.Uri.file(`${baseDir}/${linkSources[i]}`)
                const fileWebviewUri = webview.asWebviewUri(fileUri);
                str = str.replace(linkSources[i], fileWebviewUri.toString());
            }
        }
    
    
        return str;
    }	

    sendMessageToWebview(webview: vscode.Webview, type: string, data: any){
        webview.postMessage({
            type: type,
            data: data 
        });
    }

    handleMessageFromWebview(document: vscode.TextDocument, event: any){
        switch (event.type){
            case "stroke-add":{
                console.log("Stroke added");
            }
            case "stroke-remove":{
                console.log("Stroke removed");
            }
        }
    }


}