import * as vscode from "vscode";
import { CODE_ACTIONS_DOC_TYPES } from "./defines";
import { EXTENSION_COMMANDS } from "./defines";

const CODE_ACTIONS_PROVIDED = [
    vscode.CodeActionKind.QuickFix
];


const CODE_ACTIONS_COMMAND_TABLE = {
    test: {
        title: "DrawTect: Test", 
        commandName: EXTENSION_COMMANDS.test
    },
    open: {
        title: "DrawTect: Open",
        commandName: EXTENSION_COMMANDS.open
    },
    create: {
        title: "DrawTect: Create",
        commandName: EXTENSION_COMMANDS.create
    }
};


export class DT_CodeActionsProvider implements vscode.CodeActionProvider{
    // to register the provider
    public static register(context: vscode.ExtensionContext): vscode.Disposable{
        const disposable = vscode.languages.registerCodeActionsProvider(
            CODE_ACTIONS_DOC_TYPES,
            new DT_CodeActionsProvider(),
            {
                providedCodeActionKinds: CODE_ACTIONS_PROVIDED
            }
        );

        return disposable;
    }
    
    private getCodeAction(title: string, command: vscode.Command): vscode.CodeAction{
        const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
        action.command = command;
        return action;
    }


    provideCodeActions(document: vscode.TextDocument, 
                        range: vscode.Range | vscode.Selection, 
                        context: vscode.CodeActionContext, 
                        token: vscode.CancellationToken
    ): vscode.CodeAction[]{
        const actions: Array<vscode.CodeAction> = [];

        // if only click: no selection or selection is in one line
        if (range.isEmpty || (range.start.line == range.end.line)){
            const lineNo = range.start.line;
            const lineContent = document.lineAt(lineNo).text.toLowerCase();

            // drawtect: filename
            if (lineContent.includes("dt:") || lineContent.includes("drawtect:")){
                const regexp = /dt: ([\w]*)/;
                const words = lineContent.match(regexp);
                if (!words){
                    console.warn("No filename in current line");
                    return actions;
                }

                const filename = `${words[1]}.dt`;

                actions.push(this.getCodeAction(
                    `${CODE_ACTIONS_COMMAND_TABLE.open.title} file ${filename}`,
                    {
                        title: CODE_ACTIONS_COMMAND_TABLE.open.title,
                        command: CODE_ACTIONS_COMMAND_TABLE.open.commandName,
                        arguments: [filename]
                    }
                ));
            }
        }
        
        return actions;
    }

    resolveCodeAction(codeAction: vscode.CodeAction, token: vscode.CancellationToken): vscode.CodeAction{
        // codeAction.command = {
        //     title: "test",
        //     command: EXTENSION_COMMANDS.7,
        // };
        return codeAction;
    }

}
