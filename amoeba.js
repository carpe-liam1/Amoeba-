let font;
let points = [];
let pushStrength = 0.5;
let isReverting = false;
let userInput, distortionSlider;

function preload() {
  // If this fails, the canvas stays blank. Ensure the file exists!
  font = loadFont('Avante.otf'); 
}

function setup() {
  let canvasParent = select('#canvas-parent');
  let cnv = createCanvas(canvasParent.width, canvasParent.height);
  cnv.parent('canvas-parent');

  // Link HTML Elements
  userInput = select('#textInput');
  userInput.input(updateTextPoints);

  distortionSlider = select('#distortionSlider');
  distortionSlider.input(() => {
    select('#distortionValue').html(distortionSlider.value());
  });

  // Buttons
  select('#undoBtn').mousePressed(() => isReverting = !isReverting);
  select('#redoBtn').mousePressed(resetPoints);
  select('#saveBtn').mousePressed(() => saveCanvas('amoeba-design', 'png'));

  updateTextPoints();
}

function updateTextPoints() {
  let txt = userInput.value() || "AMOEBA";
  points = [];
  
  // Adjusted factor and size to fit your layout
  let textPoints = font.textToPoints(txt, width/8, height/1.8, 150, {
    sampleFactor: 0.5
  });

  for (let pt of textPoints) {
    points.push({ baseX: pt.x, baseY: pt.y, currX: pt.x, currY: pt.y });
  }
}

function resetPoints() {
  for (let p of points) {
    p.currX = p.baseX;
    p.currY = p.baseY;
  }
}

function draw() {
  background(217); // Matches #D9D9D9
  
  let maxDist = int(distortionSlider.value());
  fill(0, 14, 138); 
  noStroke();

  for (let p of points) {
    let d = dist(mouseX, mouseY, p.currX, p.currY);

    if (mouseIsPressed && d < maxDist) {
      let dx = p.currX - mouseX;
      let dy = p.currY - mouseY;
      p.currX += (dx / d) * 12 * pushStrength;
      p.currY += (dy / d) * 0.75 * pushStrength;
    }

    if (isReverting) {
      p.currX = lerp(p.currX, p.baseX, 0.05);
      p.currY = lerp(p.currY, p.baseY, 0.05);
    }

    circle(p.currX, p.currY, 4);
  }
}

let isCanvasEmpty = true;
