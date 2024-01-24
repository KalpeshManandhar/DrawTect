import * as vscode from 'vscode';

import { DT_EditorProvider } from './DrawTectEditor';
import { DT_CodeActionsProvider } from './DrawTectCodeActions';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor providers
	context.subscriptions.push(DT_EditorProvider.register(context));
	context.subscriptions.push(DT_CodeActionsProvider.register(context));
	console.log("Provider registered");
}