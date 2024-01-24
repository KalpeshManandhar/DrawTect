import * as vscode from 'vscode';
import * as fs from "fs";

import {EXTENSION_COMMANDS} from './defines'

interface DT_DocumentEdit{

}


// class DT_Document implements vscode.CustomDocument{
//     static async create(uri: vscode.Uri, 
//                             backupId: string | undefined
//                             dele
//                         )

// }


export class DT_EditorProvider implements vscode.CustomTextEditorProvider {
    constructor(
		private readonly context: vscode.ExtensionContext
	) { this.a = 0}

    static viewType = 'DrawTect.draw';
    
    a: number;

    // static test = 'DrawTect.test';

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
            enableScripts: true
        };

        const scriptLocalUri = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'dt_js.js');
        const scriptUri = webviewPanel.webview.asWebviewUri(scriptLocalUri);

        this.a++;
        webviewPanel.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">

                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->

                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <title>DRAWTECT</title>
            </head>
            <body>
                <div> HELLO</div>
                ${this.a}               
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }

}