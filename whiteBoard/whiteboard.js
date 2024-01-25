// whiteboard.js
const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');
const penOptions = document.getElementById('penOptions');
const selectionBox = document.getElementById('selectionBox');
// Set up canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let tempWidth = 1;
let tempColour = 'black';

let drawing = false;

function startPosition(e) {
  drawing = true;
  draw(e);
}

function endPosition() {
  drawing = false;
  context.beginPath();
}

function selectTool(selectedTool){
  tool = selectedTool;
}

function selectColour(selectedColour){
  context.strokeStyle = selectedColour;
  tempColour = selectedColour;
}

function selectStrokeWidth(selectedWidth){
  context.lineWidth = selectedWidth;
  tempWidth = selectedWidth;
}

function draw(e) {
  if (!drawing) return;


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

// Event listener for tool selection
document.getElementById('toolSelectionBox').addEventListener('change', function(event) {
  if (event.target.type === 'radio' && event.target.checked) {
    // If a radio button is selected, show the pop-up
    if (event.target.value === 'pen') {
      penOptions.classList.remove('disabled');
      context.lineWidth = tempWidth;
      context.strokeStyle = tempColour;
    } else if (event.target.value === 'eraser') {
      penOptions.classList.add('disabled');
      context.strokeStyle = 'white';
      context.lineWidth = 7;
    }
  }
});

  // // Function to show the pop-up box
  // function showPopUp(tool) {
  //   document.getElementById('selectedTool').innerText = tool;
  //   document.getElementById('popUpBox').classList.remove('hidden');
  // }

  // // Function to close the pop-up box
  // function closePopUp() {
  //   document.getElementById('popUpBox').classList.add('hidden');
  // }

