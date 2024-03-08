// whiteboard.js

import { Rect, findBoundBox, insideRect, rectRectBoundingBox, rectRectOverlap } from "./bound.js";
import { Camera2D } from "./camera.js";
import { vscode } from "./interface.js";
import { SelectTool } from "./selection.js";
import { cubicBezierSplineFit } from "./spline.js";

import drawShapes from "./shapes.js";
const drawShape = new drawShapes;

import  eraser  from "./eraser.js";
const ERASER = new eraser;
// detect user's colour mode
function isDarkModePreferred() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

import { toggleColorScheme } from "./user_mode.js";
import { sendToHTR } from "./htrInterface.js";
import { Img } from "./images.js";
import { TextBox } from "./textbox.js";
toggleColorScheme(isDarkModePreferred());

// Event listener for changes in color scheme preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', toggleColorScheme);


const canvas = document.getElementById('whiteboard'),
context = canvas.getContext('2d');
export { context };

const colourButtons = document.querySelectorAll(".color"),
strokeButtons = document.querySelectorAll(".stroke"),
penOptions = document.getElementById('penOptions'),
tools = document.getElementById('toolSelectionBox'),
fun = document.getElementById('functions'),
fillColor = document.querySelector("#fill"),
smoothen = document.querySelector('#smooth'),
debug = document.querySelector('#debuginfo'),
// storebtn = document.querySelector(".saveImage"),
// clearbtn = document.querySelector(".clearCanvas"),
toolButtons = document.querySelectorAll(".tool"),
enableEdit = document.getElementById('initialOptions');

const stateBools = {
  "panning": false,
  "spacebar": false,
  "smoothing": false,
  "show_control_points": false,
  "selecting": false,
  "moving": false,
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
let clickedAt = {x:0, y:0};



let strokesStack = [];
let redoStrokesStack = [];
let currentStroke = [];

let images = [];
// images.push(new Img("/test/test.jpg", "filepath"));

// let textAreas = [];


let drawing = false;

let camera = new Camera2D(canvas.width, canvas.height, {x:0,y:0})
let tool_SELECT = new SelectTool();
//let tool_ERASER = new SelectTool();

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
  clickedAt = {x: e.clientX, y: e.clientY};

  if (stateBools.spacebar){
    stateBools.panning = true;
    return;
  }

  // the select tool
  if (selectedTool == "select"){
    tool_SELECT.start(clickedAt, camera);
    return;
  }

  if (selectedTool == "eraser"){
    ERASER.startErasing(clickedAt);
    return;
  }

  if (smoothen.checked && selectedTool == "pen"){
    stateBools.smoothing = true;
  }
  else{
    stateBools.smoothing = false;
  }

  console.log("start");
  currentStroke = [];
  currentStroke.push({x: e.clientX + camera.pos.x, y: e.clientY + camera.pos.y});

  drawing = true;
  singleElement = true;

  prevMousePosX = e.clientX;
  prevMousePosY = e.clientY;

  context.beginPath();
  context.lineWidth = tempWidth;
  context.strokeStyle = tempColour;
  context.fillStyle = tempColour;

  snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
}

function endPosition() {
  if (stateBools.panning){
    stateBools.panning = false;
    return;
  }

  if (selectedTool == "select"){
    const changes = tool_SELECT.end(strokesStack, images, camera)

    if (changes.length > 0){
      vscode.postMessage({
        type: "stroke-move",
        data: changes
        
      });
    }
  }

  if (selectedTool == "eraser"){
    const erasedI = ERASER.end();
    
		console.log("received the indices for erased strokes : ", erasedI);
    if (erasedI.length > 0){
      vscode.postMessage({
        type: "stroke-remove",
        data: erasedI
        
      });
    }
  }

  if (!drawing) return;

  drawing = false;

  const stroke = (stateBools.smoothing && currentStroke.length > 4)? 
                  cubicBezierSplineFit(currentStroke) : currentStroke;
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

}


function draw(e) {
  if (stateBools.panning){
    camera.pos.x -= e.clientX - prevCursorPos.x; 
    camera.pos.y -= e.clientY - prevCursorPos.y; 
    redrawAllStrokes();
  }

  
  prevCursorPos.x = e.clientX;
  prevCursorPos.y = e.clientY;


  if (selectedTool == "select"){
    tool_SELECT.cursorMove(strokesStack, images, {x: e.clientX, y: e.clientY}, camera);
  }

  if (selectedTool === "eraser"){

    ERASER.eraseSelected(strokesStack, {x:e.clientX, y:e.clientY}, camera);
  
  }

  if (!drawing) return;

  context.putImageData(snapshot,0,0);

  context.lineCap = 'round';

  
  if(selectedTool === "rectangle"){
    
   currentStroke = drawShape.strokeRectangle(e, prevMousePosX, prevMousePosY);
  }

  else if(selectedTool === "diamond"){

    currentStroke = drawShape.strokeDiamond(e, prevMousePosX, prevMousePosY);
  }

  else if(selectedTool === "circle"){

    let finalRadius = drawShape.strokeCircle(e, prevMousePosX, prevMousePosY);
    let tempX = e.clientX;
    let tempY = e.clientY;

    let centerX = prevMousePosX + ((tempX - prevMousePosX)/2);
    let centerY = prevMousePosY + ((tempY - prevMousePosY)/2);
    currentStroke = drawShape.getFinalCircle(e, finalRadius, centerX, centerY,500);
  }


  else{
    context.lineTo(e.clientX, e.clientY);
    currentStroke.push({x: e.clientX + camera.pos.x, y: e.clientY + camera.pos.y});
    context.stroke();
  }
}


  
function disableWhiteboard(){
  allowUndo = false;
  penOptions.classList.add("disabled");
  tools.classList.add("disabled");
  fun.classList.add("disabled");
  enableEdit.classList.remove("disabled");
}

export function drawStroke(stroke, color, width){
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

// rect is [min, max]
export function drawRect(rect, color, width=1){
  context.save();
  
  context.strokeStyle = `${color}`;
  context.lineWidth = width;

  context.beginPath();
  context.moveTo(rect[0].x, rect[0].y);
  context.lineTo(rect[0].x, rect[1].y);
  context.lineTo(rect[1].x, rect[1].y);
  context.lineTo(rect[1].x, rect[0].y);
  context.lineTo(rect[0].x, rect[0].y);
  context.stroke();
  context.closePath();

  context.restore();
}

export function redrawAllStrokes(){
  console.log(`redraw all ${strokesStack.length} strokes`)

  clearBackground("white");
  for (let stroke of strokesStack){
    const strokeScreenSpace = stroke.points.map(p => {
      return camera.toScreenSpace(p);
    })

    switch (stroke.type){

      case "sp":{
        drawCubicBezierSpline(strokeScreenSpace, stroke.color, stroke.width);
        if (debug.checked){
          drawStroke(strokeScreenSpace, "red", 1);
        }
        break;
      }
      default: {
        drawStroke(strokeScreenSpace, stroke.color, stroke.width);
      }
    }

    if (debug.checked) {
      const boundsScreenSpace = [
        camera.toScreenSpace(stroke.bounds[0]),
        camera.toScreenSpace(stroke.bounds[1])
      ];
      drawRect(boundsScreenSpace, "red", 1);
    }
  }

  for (let image of images){
    image.draw(context, camera)
  }

  
}


export function drawCubicBezierSpline(points, color, width){
  const nSegments = (points.length-1)/3;

  for (let i = 0; i<nSegments; i++){
    drawCubicBezier(points.slice(i*3, i*3+4), color, width);
  }
}


function drawCubicBezier(points, color, width){
  context.save();
  
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
  context.restore();
}



// update webview from file: draw the strokes
async function updateFromFile(strokesArr){
  strokesStack = await Promise.all(strokesArr.map(a => {
    return {
      ...a,
      bounds: findBoundBox(a.points) 
    }
  }));
  redrawAllStrokes();
}




// messages from extension to webview
window.addEventListener('message', e => {
  const message = e.data;
  console.log("received messgae from exit")

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
  // if spacebar pressed 
  if (event.key == ' '){
    stateBools.panning = true;
  }
});

document.addEventListener('keyup', function(event){
  // if spacebar pressed 
  if (event.key == ' '){
    stateBools.spacebar = false;
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

// clearbtn.addEventListener("click", () =>{
//   context.clearRect(0,0, canvas.width, canvas.height);
// });

// storebtn.addEventListener("click", ()=>{
//   disableWhiteboard();
//   canvas.style.pointerEvents = 'none';
// });

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);
document.addEventListener('keydown', (e) => {
  if (e.key == 'p'){
    console.log("P pressed")
    if (selectedTool == "select"){
      const imageData = tool_SELECT.getStrokesImage(strokesStack);
      console.log(imageData);
      sendToHTR(imageData);
    }
  }
})


window.addEventListener("keydown", async (e) => {
  if (e.ctrlKey && e.key == 'v'){
    const contents = await navigator.clipboard.read();
    console.log(contents);
    for (const item of contents){
      if (item.types.includes("image/png")){
        const blob = await item.getType("image/png");
        images.push(new Img(URL.createObjectURL(blob), "blob"));
      }
      else if (item.types.includes("text/plain")){
        // images.push(new Img());
      }

      
    }
  }
})

let a = true;
// canvas.addEventListener("click", e => {
//   if (a){
//     const worldPos = camera.toWorldSpace({x: e.clientX, y: e.clientY});
//     textAreas.push(new TextBox(worldPos));
//     a = false;
//   }
// })


canvas.style.pointerEvents = 'none';
const state = vscode.getState();
if (state) {
  updateFromFile(state.strokes);
}
