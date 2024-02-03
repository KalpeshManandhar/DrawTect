import * as fs from 'fs';

export function loadHtmlAsWebviewResource(baseDir: string, htmlFile: string): string{
	let str = fs.readFileSync(htmlFile, 'utf-8');

	const scriptRegex = /<script [\w\W\s]*src\s*=\s*"([\W\w]*)">/;
	const scriptSources = str.match(scriptRegex);

	if (scriptSources){
		for (let i = 1; i< scriptSources.length; i++){	
			const replaceWith = `${baseDir}/${scriptSources[i]}`
			str = str.replace(scriptSources[i], replaceWith);
		}
	}
	
	const linkRegex = /<link [\w\W\s]*href\s*=\s*"([\W\w]*)">/;
	const linkSources = str.match(linkRegex);

	if (linkSources){
		for (let i = 1; i< linkSources.length; i++){	
			const replaceWith = `${baseDir}/${linkSources[i]}`
			str = str.replace(linkSources[i], replaceWith);
		}
	}


	return str;
}	


