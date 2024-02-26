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

export function Rect(p1, p2){
	const min = {
		x: Math.min(p1.x, p2.x),
		y: Math.min(p1.y, p2.y)
	};
	const max = {
		x: Math.max(p1.x, p2.x),
		y: Math.max(p1.y, p2.y)
	};
	return [min, max];

}


export function rectRectOverlap(a,b){
	const overlapX = 	((a[0].x >= b[0].x) && (a[0].x <= b[1].x)) || 
						((b[0].x >= a[0].x) && (b[0].x <= a[1].x));
	const overlapY =   	((a[0].y >= b[0].y) && (a[0].y <= b[1].y)) ||  
						((b[0].y >= a[0].y) && (b[0].y <= a[1].y));
	return overlapX && overlapY;
}

export function rectRectBoundingBox(a,b){
	const min = {
		x: Math.min(a[0].x, b[0].x),
		y: Math.min(a[0].y, b[0].y)
	};
	const max = {
		x: Math.max(a[1].x, b[1].x),
		y: Math.max(a[1].y, b[1].y)
	};

	return [min, max];
}

export function insideRect(pt, rect){
	return 	(pt.x >= rect[0].x &&  pt.x <= rect[1].x) && 
			(pt.y >= rect[0].y &&  pt.y <= rect[1].y);
}