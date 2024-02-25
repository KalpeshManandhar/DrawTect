// returns [min, max]
export function findBoundBox(points){
	if (points.length == 0)
		return [];

	let max = {x: points[0].x, y: points[0].y};
	let min = {x: points[0].x, y: points[0].y};

	for (let point of points){
		max.x = Math.max(max.x, point.x); 
		max.y = Math.max(max.y, point.y); 
		min.x = Math.min(min.x, point.x); 
		min.y = Math.min(min.y, point.y); 
	}

	return [min, max];
}