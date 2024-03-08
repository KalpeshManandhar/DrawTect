function dataURLtoBlob(dataURL) {
	const byteString = atob(dataURL.split(',')[1]);
	const ab = new ArrayBuffer(byteString.length);
	const ia = new Uint8Array(ab);
	for (let i = 0; i < byteString.length; i++) {
	  	ia[i] = byteString.charCodeAt(i);
	}
	return new Blob([ab], { type: "png" });
}

export async function sendToHTR(imageData){
	console.log("imageData");
	console.log(imageData);
	const formData = new FormData();

	// Append the image data as a file with the key 'file'
	formData.append('file', dataURLtoBlob(imageData));
	console.log( dataURLtoBlob(imageData));
	for (const key of formData.keys()) {
		console.log(key);
	}

	let detected = "";
	await fetch('http://127.0.0.1:5000/prediction', {
		method: 'POST',
		body: formData,
	})
	.then(response => response.json())
	.then(data => {
		console.log(data)
		detected = data.image;
	})
	.catch(error => {
		console.error('Error sending image data:', error);
	});

	return detected;
}