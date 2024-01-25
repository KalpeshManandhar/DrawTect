// whiteboard.js
const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');
const bluepen = document.getElementById('blue');
const selectionBox = document.getElementById('selectionBox');
// Set up canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;

function startPosition(e) {
  drawing = true;
  draw(e);
}

function endPosition() {
  drawing = false;
  context.beginPath();
}

function selectColour(selectedColour){
  context.strokeStyle = selectedColour;
}

function draw(e) {
  if (!drawing) return;

  context.lineWidth = 5;
  context.lineCap = 'round';

  context.lineTo(e.clientX, e.clientY);
  context.stroke();
  context.beginPath();
  context.moveTo(e.clientX, e.clientY);
}

// Event listeners
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

  // Function to show the pop-up box
  function showPopUp(tool) {
    document.getElementById('selectedTool').innerText = tool;
    document.getElementById('popUpBox').classList.remove('hidden');
  }

  // Function to close the pop-up box
  function closePopUp() {
    document.getElementById('popUpBox').classList.add('hidden');
  }

  // Event listener for tool selection
  document.getElementById('toolSelectionBox').addEventListener('change', function(event) {
    if (event.target.type === 'radio' && event.target.checked) {
      // If a radio button is selected, show the pop-up
      showPopUp(event.target.value);
    }
  });