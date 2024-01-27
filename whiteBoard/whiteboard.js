// whiteboard.js
const canvas = document.getElementById('whiteboard'),
context = canvas.getContext('2d'),
colourButtons = document.querySelectorAll(".color"),
strokeButtons = document.querySelectorAll(".stroke"),
penOptions = document.getElementById('penOptions'),
fillColor = document.querySelector("#fill"),
toolButtons = document.querySelectorAll(".tool");


// Set up canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let tempWidth = 1,
tempColour = 'black',
selectedTool = "pen",
prevMousePosX , prevMousePosY, snapshot;


let drawing = false;

function startPosition(e) {
  drawing = true;
  prevMousePosX = e.clientX - canvas.getBoundingClientRect().left;
  prevMousePosY = e.clientY - canvas.getBoundingClientRect().top;
  context.beginPath();
  context.lineWidth = tempWidth;
  context.strokeStyle = tempColour;
  context.fillStyle = tempColour;
  snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
}

function endPosition() {
  drawing = false;
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
  if (!drawing) return;
  context.putImageData(snapshot,0,0);
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
  context.stroke();
  }
}

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

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);