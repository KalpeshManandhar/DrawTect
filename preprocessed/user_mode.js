export function toggleColorScheme(darkmode) {
	const toolbox = document.getElementById('toolSelectionBox'),
	penbox = document.getElementById('penOptions'),
	functionBox = document.getElementById('functions'),
	enableEdit = document.getElementById('initialOptions'),
	functionOptions = document.querySelectorAll(".btn");
  
	if (darkmode) {
			toolbox.classList.add('dark-mode');
			penbox.classList.add('dark-mode');
			functionBox.classList.add('dark-mode');
			enableEdit.classList.add('dark-mode');
			functionOptions.forEach(btn => {
			btn.classList.add('dark-mode');
		});
	} else {
		toolbox.classList.remove('dark-mode');
		penbox.classList.remove('dark-mode');
		functionBox.classList.remove('dark-mode');
		enableEdit.classList.remove('dark-mode');
		functionOptions.forEach(btn => {
			btn.classList.remove('dark-mode');
		});
	}
  }