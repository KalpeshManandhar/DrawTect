// whiteboard.js

import { Camera2D } from "./camera.js";
import { vscode } from "./interface.js";
import { cubicBezierSplineFit } from "./spline.js";

// detect user's colour mode
function isDarkModePreferred() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function toggleColorScheme() {
  const toolbox = document.getElementById('toolSelectionBox'),
  penbox = document.getElementById('penOptions'),
  functionBox = document.getElementById('functions'),
  enableEdit = document.getElementById('initialOptions'),
  functionOptions = document.querySelectorAll(".btn");

  if (isDarkModePreferred()) {
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
toggleColorScheme();

// Event listener for changes in color scheme preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', toggleColorScheme);


const canvas = document.getElementById('whiteboard'),
context = canvas.getContext('2d'),
colourButtons = document.querySelectorAll(".color"),
strokeButtons = document.querySelectorAll(".stroke"),
penOptions = document.getElementById('penOptions'),
tools = document.getElementById('toolSelectionBox'),
fun = document.getElementById('functions'),
fillColor = document.querySelector("#fill"),
storebtn = document.querySelector(".saveImage"),
clearbtn = document.querySelector(".clearCanvas"),
toolButtons = document.querySelectorAll(".tool"),
enableEdit = document.getElementById('initialOptions');

const stateBools = {
  "panning": false,
  "space": false,
  "smoothing": true,
  "show_control_points": true
};




// Set up canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//initialization
let tempWidth = 1,
tempColour = 'black',
selectedTool = "pen",allowUndo = true,
prevMousePosX , prevMousePosY, snapshot, singleElement = true;

let prevCursorPos = {x:0, y:0}; 

let strokesStack = [];
let redoStrokesStack = [];
let currentStroke = [];

let drawing = false;

let camera = new Camera2D(canvas.width, canvas.height, {x:0,y:0})


class Stack{
  constructor(){
    this.items = [];
  }

  push(element){
    this.items.push(element);
  }

  // Pop out all
  pop(){
    if(this.items.length === 0){
      return null;
    }
    return this.items.pop();
  }

  // peek the previous
  peek(){
    return this.items.length === 0 ? 
    null : this.items[this.items.length --];
  }

  isEmpty(){
    return this.items.length === 0;
  }

  // stack size
  size(){
    return this.items.length;
  }
}

const snapshotStack = new Stack();

function startPosition(e) {
  if (stateBools.space){
    stateBools.panning = true;
    return;
  }



  console.log("start");
  currentStroke = [];
  currentStroke.push({x: e.clientX + camera.pos.x, y: e.clientY + camera.pos.y});

  drawing = true;
  singleElement = true;
  prevMousePosX = e.clientX - canvas.getBoundingClientRect().left;
  prevMousePosY = e.clientY - canvas.getBoundingClientRect().top;
  context.beginPath();
  context.lineWidth = tempWidth;
  context.strokeStyle = tempColour;
  context.fillStyle = tempColour;
  // snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
}

function endPosition() {
  if (stateBools.panning)
    stateBools.panning = false;

  if (!drawing) return;

  drawing = false;

  const stroke = (stateBools.smoothing)? cubicBezierSplineFit(currentStroke) : currentStroke;
  const type = (stateBools.smoothing)?"sp":"s";
  vscode.postMessage({
    type: "stroke-add",
    data: {
      type: type,
      points: stroke,
      color: tempColour,
      width: tempWidth,
    }
  });
  singleElement = false;
//context.beginPath();
}

const drawRectangle = (e) => {
  if(!fillColor.checked){
  return context.strokeRect(e.offsetX, e.offsetY, prevMousePosX - e.offsetX, prevMousePosY - e.offsetY);
  }
  context.fillRect(e.offsetX, e.offsetY, prevMousePosX - e.offsetX, prevMousePosY - e.offsetY);
};

const drawDiamond = (e) => {
  const size = Math.min(Math.abs(prevMousePosX - e.offsetX), Math.abs(prevMousePosY - e.offsetY));
  const centerX = (prevMousePosX + e.offsetX) /2;
  const centerY = (prevMousePosY + e.offsetY) /2;
  // current transformation state
  context.save();

  // trandlating the canvas to the center of the rectangle
  context.translate(centerX, centerY);

  // rotating the canvas by 45 degrees
  context.rotate((45 * Math.PI) /180);
  if(fillColor.checked){
    context.fillRect(-size /2, -size /2, size, size);
  }
  // drawing the rectangle wit rotated coordinates
  context.strokeRect(-size /2, -size /2, size, size);

  // restoring the canvas
  context.restore();

};

const drawCircle = (e) => {
  context.beginPath();

  let radius = Math.sqrt(Math.pow((prevMousePosX - e.offsetX), 2) + Math.pow((prevMousePosY - e.offsetY),2));
  context.arc(prevMousePosX, prevMousePosY, radius, 0, 2 * Math.PI);

  fillColor.checked ? context.fill() : context.stroke();
  context.stroke();
  context.closePath();
  context.beginPath();
};

function draw(e) {
  if (stateBools.panning){
    camera.pos.x -= e.clientX - prevCursorPos.x; 
    camera.pos.y -= e.clientY - prevCursorPos.y; 
    redrawAllStrokes();
  }

  prevCursorPos.x = e.clientX;
  prevCursorPos.y = e.clientY;

  if (!drawing) return;
  // context.putImageData(snapshot,0,0);
  
  // if(singleElement){
  //   snapshotStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
  //   singleElement = false;  
  // }
  // context.putImageData(snapshot,0,0);
  context.lineCap = 'round';

  if(selectedTool === "rectangle"){
    drawRectangle(e);
  }
  else if(selectedTool === "diamond"){
    drawDiamond(e);
  }
  else if(selectedTool === "circle"){
    drawCircle(e);
  }
  else{
    context.strokeStyle = selectedTool === "eraser" ? '#fff':tempColour;
    context.lineTo(e.clientX, e.clientY);
    currentStroke.push({x: e.clientX + camera.pos.x, y: e.clientY + camera.pos.y});
    context.stroke();
  }
}

  // if(singleElement){
  //   // snapshotStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
  //   singleElement = false;  
  // }
  
function disableWhiteboard(){
  allowUndo = false;
  penOptions.classList.add("disabled");
  tools.classList.add("disabled");
  fun.classList.add("disabled");
  enableEdit.classList.remove("disabled");
}

function drawStroke(stroke, color, width){
  if (stroke.length == 0) 
    return;

  context.save();
  context.strokeStyle = `${color}`;
  context.lineWidth = width;

  context.beginPath();

  context.moveTo(stroke[0].x, stroke[0].y);

  for (let point of stroke){
    context.lineTo(point.x, point.y);
  }
  context.stroke();
  context.restore();

}


function clearBackground(color){
  context.fillStyle = `${color}`;
  context.fillRect(0, 0, canvas.width, canvas.height);
}


function redrawAllStrokes(){
  console.log(`redraw all ${strokesStack.length} strokes`)

  clearBackground("white");
  for (let stroke of strokesStack){
    const strokeScreenSpace = stroke.points.map(p => {
      return camera.toScreenSpace(p);
    })

    switch (stroke.type){

      case "sp":{
        drawCubicBezierSpline(strokeScreenSpace, stroke.color, stroke.width);
        if (stateBools.show_control_points) 
          drawStroke(strokeScreenSpace, "red", 1);
        break;
      }
      default: {
        drawStroke(strokeScreenSpace, stroke.color, stroke.width);
      }
    }
  }

  
}


function drawCubicBezierSpline(points, color, width){
  const nSegments = (points.length-1)/3;

  for (let i = 0; i<nSegments; i++){
    drawCubicBezier(points.slice(i*3, i*3+4), color, width);
  }
}


function drawCubicBezier(points, color, width){
  context.beginPath();
  context.lineWidth = width;
  context.strokeStyle = `${color}`;

  context.moveTo(points[0].x, points[0].y);

  context.bezierCurveTo(
    points[1].x, points[1].y, 
    points[2].x, points[2].y, 
    points[3].x, points[3].y, 
  );

  context.stroke();
  context.closePath();
}



// update webview from file: draw the strokes
async function updateFromFile(strokesArr){
  strokesStack = await Promise.all(strokesArr.map(a => a));
  redrawAllStrokes();
}




// messages from extension to webview
window.addEventListener('message', e => {
  const message = e.data;
  console.log("received messgae from ext")

  switch (message.type){
    case 'update':{
      console.log(message);

      updateFromFile(message.data.strokes);

      vscode.setState(message.data);

      break;
    }
  }

});




// keyboard Event Listener
document.addEventListener('keydown', function(event) {

  if(!allowUndo){
    return;
  }
  if(event.ctrlKey && event.key === 'z' ){
    console.log("Undo")
    if(false && !(strokesStack.length == 0)){

      snapshot = snapshotStack.pop();
      // context.putImageData(snapshot,0,0);
      
      const lastStroke = strokesStack.pop();
      redoStrokesStack.push(lastStroke);
      redrawAllStrokes();
    }
  }
  
  else if(event.ctrlKey && event.key === 'y' ){
    if(!(redoStrokesStack.length == 0)){
      console.log("Redo")


      snapshot = snapshotStack.pop();
      // context.putImageData(snapshot,0,0);
      
      const lastUndidStroke = redoStrokesStack.pop();
      strokesStack.push(lastUndidStroke);
      drawStroke(lastUndidStroke);
    }
  }
});

document.addEventListener('keydown', function(event){

  if(event.key === 'e'){
    canvas.style.pointerEvents = 'auto';
    canvas.classList.remove("disabled");
    penOptions.classList.remove("disabled");
    tools.classList.remove("disabled");
    fun.classList.remove("disabled");
    allowUndo = true;
  }
});

document.addEventListener('keydown', function(event){
  if(event.key === 's'){
    disableWhiteboard();
    canvas.style.pointerEvents = 'none';
  }
  // if space pressed 
  if (event.key == ' '){
    stateBools.panning = true;
  }
});

document.addEventListener('keyup', function(event){
  // if space pressed 
  if (event.key == ' '){
    stateBools.space = false;
    stateBools.panning = false;
  }
});

// Mouse Event Listeners
toolButtons.forEach(btn =>{
    btn.addEventListener("click", ()=> {
      //updating the active status of tools
      console.log(btn.id);
      document.querySelector(".option.active").classList.remove("active");
      btn.classList.add("active");
      btn.id === 'eraser' ? penOptions.classList.add("disabled"):penOptions.classList.remove("disabled");
      selectedTool = btn.id;
    });
});

enableEdit.addEventListener("click",() =>{
  enableEdit.classList.add("disabled");
  canvas.style.pointerEvents = 'auto';
  canvas.classList.remove("disabled");
  penOptions.classList.remove("disabled");
  tools.classList.remove("disabled");
  fun.classList.remove("disabled");
  allowUndo = true;
});

colourButtons.forEach(btn=> {
  btn.addEventListener("click", () => {
    console.log(btn.id);
    document.querySelector(".c.active").classList.remove("active");
    btn.classList.add("active");
    tempColour = btn.id;
  });
});

strokeButtons.forEach(btn2=> {
  btn2.addEventListener("click", () => {
    console.log(btn2.id);
    document.querySelector(".s.active").classList.remove("active");
    btn2.classList.add("active");
    tempWidth = btn2.id;
  });
});

clearbtn.addEventListener("click", () =>{
  context.clearRect(0,0, canvas.width, canvas.height);
});

storebtn.addEventListener("click", ()=>{
  // const link = document.createElement("a");
  // link.download = `${Date.now()}.jpg`;
  // link.href = canvas.toDataURL();
  // link.click();
  disableWhiteboard();
  canvas.style.pointerEvents = 'none';
});

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

canvas.style.pointerEvents = 'none';
const state = vscode.getState();
if (state) {
  updateFromFile(state.strokes);
}