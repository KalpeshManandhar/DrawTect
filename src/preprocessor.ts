import * as vscode from 'vscode';
import * as fs from 'fs';

import { PREPROCESSOR_EXPORT_FOLDER, WHITEBOARD_FOLDER } from './defines';

export class Preprocessor{
	workspaceDir: string;
	webview: vscode.Webview;
	
	exportDir(){
		return `${this.workspaceDir}/${PREPROCESSOR_EXPORT_FOLDER}`;
	}
	
	constructor(workspaceDir: string, webview: vscode.Webview){
		this.workspaceDir = workspaceDir;
		this.webview = webview;
		
		
		if (!fs.existsSync(this.exportDir())){
			fs.mkdirSync(this.exportDir());
		}
	}
	
	public preprocessDir(relDirPath: string){
		const absDirPath = `${this.workspaceDir}/${relDirPath}`;
		const absDirPathDest = `${this.workspaceDir}/${PREPROCESSOR_EXPORT_FOLDER}`;
		
		if (!fs.existsSync(absDirPath)){
			console.log(`Dir ${absDirPath} doesn't seem to exist`);
			return;
		}
		
		// assuming there are no files referencing other files in assets folder
		const assetsFolder = `${absDirPath}/assets`;
		if (fs.existsSync(assetsFolder)){
			const destPath = `${absDirPathDest}/assets`;
			if (!fs.existsSync(destPath)){
				fs.mkdirSync(destPath);
			}
			fs.cpSync(assetsFolder, destPath, {recursive: true});
		}
		
		const files = fs.readdirSync(absDirPath);
		for (let file of files){
			const absFilePath = `${absDirPath}/${file}`;
			
			// if is file
			if (fs.lstatSync(absFilePath).isFile()){
				const regex = /[\w\s-]*.(\w*)/;
				let fileExtension = regex.exec(file);
				
				if (!fileExtension){
					continue;
				}

				switch(fileExtension[1]){
					case "html":{
						this.preprocessAndExportHTML(
							relDirPath, file  
						);
						console.log(`HTML File: ${file}`);
						break;
					}
					case "js":{
						this.preprocessAndExportJS(
							relDirPath, file  
						);
							console.log(`JS File: ${file}`);
							break;
					}
					case "css":{
						this.preprocessAndExportCSS(
							relDirPath, file  
						);
						console.log(`CSS File: ${file}`);
						break;
					}
				}
			}
		}
	}
		

	private preprocessAndExportHTML(baseDir: string, htmlFile: string){
		const regex = /["']([\w*\\*/*.*\s*]*.(?:css|js|png|svg|jpeg|jpg))["']/g;
		this.preprocessPathAndExport(baseDir, htmlFile, regex);
	}
	
	private preprocessAndExportJS(baseDir: string, jsFile: string){
		const regex = /["']([\w*\\*/*.*\s*]*.(?:css|js|png|svg|jpeg|jpg))["']/g;
		this.preprocessPathAndExport(baseDir, jsFile, regex);
	}
	
	private preprocessAndExportCSS(baseDir: string, cssFile: string){
		const regex = /["']([\w*\\*/*.*\s*]*.(?:png|svg|jpeg|jpg))["']/g;
		this.preprocessPathAndExport(baseDir, cssFile, regex);
	}

	/*
		@param baseDir: the relative path of the directory relative to workspace
		@param file: the relative path of the file from the baseDir
		@param regex: the regex to match the paths
	*/
	private preprocessPathAndExport(baseDir: string, file: string, regex: RegExp){
		const fullPath = `${this.workspaceDir}/${baseDir}/${file}`;
		let str = fs.readFileSync(fullPath, 'utf-8');

		
		str = this.matchAndReplace(regex, str);
		
		const EXPORT_FOLDER_ABS = `${this.workspaceDir}/${PREPROCESSOR_EXPORT_FOLDER}`
		const writeFilePath = `${EXPORT_FOLDER_ABS}/${file}`;
		if (!fs.existsSync(EXPORT_FOLDER_ABS)){
			fs.mkdirSync(EXPORT_FOLDER_ABS);
		}
		fs.writeFileSync(writeFilePath, str, "utf8");
	}	

	private matchAndReplace(regex: RegExp, str: string): string{
		let searches;
		while ((searches = regex.exec(str)) !== null){
			for (let i = 1; i<searches.length; i++){
				const fileUri = vscode.Uri.file(`${this.exportDir()}/${searches[i]}`);
				const fileWebviewUri = this.webview.asWebviewUri(fileUri);
				str = str.replace(searches[i], fileWebviewUri.toString());
			}
		}
		return str;
	}

};