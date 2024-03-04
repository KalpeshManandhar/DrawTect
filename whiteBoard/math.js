export function magnitude(v){
	return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function distance(p1, p2){
	const v = {x: p2.x - p1.x, y: p2.y - p1.y};
	return magnitude(v); 
}

export function determinant2(mat){
	return (mat[0] * mat[3] - mat[1] * mat[2]);
}

export function determinant3(mat){
	const u0 = [
		mat[4], mat[5],
		mat[7], mat[8],
	];
	const u1 = [
		mat[3], mat[5],
		mat[6], mat[8],
	];
	const u2 = [
		mat[3], mat[4],
		mat[6], mat[7],
	];

	let res = 0;
	res += mat[0] * determinant2(u0);
	res -= mat[1] * determinant2(u1);
	res += mat[2] * determinant2(u2);
	return res;
}

export function solveSystem2(coeffMat, constantMat){
	const d = determinant2(coeffMat);
	if (d == 0){
		console.log("moye moye");
		console.log(coeffMat);
		console.log(constantMat);
		return [0,0];
	}
	const m0 = [constantMat[0], coeffMat[1],
				constantMat[1],	coeffMat[3]];
	const m1 = [coeffMat[0], constantMat[0],
			  	coeffMat[2], constantMat[1]	];

	const d0 = determinant2(m0);
	const d1 = determinant2(m1);

	return [d0/d, d1/d];
}

export function solveSystem3(coeffMat, constantMat){
	const d = determinant3(coeffMat);
	if (d == 0){
		console.log("moye moye");
		console.log(coeffMat);
		console.log(constantMat);
		return [0,0,0];
	}

	const m0 = [
		constantMat[0], coeffMat[1], coeffMat[2], 
		constantMat[1], coeffMat[4], coeffMat[5], 
		constantMat[2], coeffMat[7], coeffMat[8], 
	];
	
	const m1 = [
		coeffMat[0], constantMat[0], coeffMat[2],
		coeffMat[3], constantMat[1], coeffMat[5],
		coeffMat[6], constantMat[2], coeffMat[8],
	];

	const m2 = [
		coeffMat[0], coeffMat[1], constantMat[0],
		coeffMat[3], coeffMat[4], constantMat[1],
		coeffMat[6], coeffMat[7], constantMat[2],
	];

	const d0 = determinant3(m0);
	const d1 = determinant3(m1);
	const d2 = determinant3(m2);

	return [d0/d, d1/d, d2/d];
}

export function lerp(a,b,t){
	return a + (b-a) * t;
}
