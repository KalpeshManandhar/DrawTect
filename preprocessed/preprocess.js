import { solveSystem2 } from "https://file%2B.vscode-resource.vscode-cdn.net/c%3A/DrawTect/preprocessed/./math.js";


function fitLine(points){
	const n = points.length;
	let sumX = 0, sumX2 = 0, sumXY = 0, sumY = 0;

	for (let point of points){
		sumX  += point.x;
		sumX2 += point.x * point.x; 
		sumXY += point.x * point.y;
		sumY += point.y;
	}

	const coeff = [
		n, sumX,
		sumX, sumX2
	];

	const constant = [
		sumY,
		sumXY
	];
	
	const soln = solveSystem2(coeff, constant);
	return soln;
}

export function preprocess(strokes){
	const centers = strokes.map(s => {
		return {
			x: s.bounds[0].x + 0.5 * (s.bounds[1].x - s.bounds[0].x),
			y: s.bounds[0].y + 0.5 * (s.bounds[1].y - s.bounds[0].y)
		};
	})

	const fit = fitLine(centers);
	console.log(`fit:${fit}`);
	const angle = Math.atan(fit[1]);
	console.log(`Angle:${angle* 180 / Math.PI}`);

	return [angle, centers[0]];

}