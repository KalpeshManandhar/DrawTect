import * as vscode from 'vscode';

import { DT_EditorProvider } from './DrawTectEditor';
import { DT_CodeActionsProvider } from './DrawTectCodeActions';
// import { sendDataForHTR } from './HTRInterface';


export function activate(context: vscode.ExtensionContext) {


    vscode.window.onDidChangeTextEditorSelection(e => {
        const text = e.textEditor.document.getText(e.selections[0]);
        if (text.includes('dt:')|| text.includes("drawtect:")) {
            // Register our custom editor providers
            context.subscriptions.push(DT_EditorProvider.register(context));
            context.subscriptions.push(DT_CodeActionsProvider.register(context));

            console.log("Provider registered");
        }
    });

	// sendDataForHTR([]);

}
