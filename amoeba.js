
let points = [];
let pushStrength = 0.5;
let isReverting = false;
let userInput, distortionSlider, horizontalDistortionSlider, verticalDistortionSlider;

function preload() {
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

  horizontalDistortionSlider = select('#horizontalDistortionSlider');
  horizontalDistortionSlider.input(() => {
    select('#horizontalDistortionValue').html(horizontalDistortionSlider.value());
  });

  verticalDistortionSlider = select('#verticalDistortionSlider');
  verticalDistortionSlider.input(() => {
    select('#verticalDistortionValue').html(verticalDistortionSlider.value());
  });

  // Buttons
  select('#undoBtn').mousePressed(() => isReverting = !isReverting);
  select('#redoBtn').mousePressed(resetPoints);
  select('#saveBtn').mousePressed(() => saveCanvas('amoeba-design', 'png'));

  updateTextPoints();
}

function updateTextPoints() {
  let rawTxt = userInput.value() || "AMOEBA";
  points = [];
  
  if (!font) return;

  let fontSize = 150; // Retaining your exact desktop font size
  let lineSpacing = fontSize * 1.1; // Distance between stacked lines
  let startX = width / 8; // Restored safety margin: text always starts safely inside the screen
  let baseStartY = height / 1.8; // Your original baseline height for line 1

  
  let maxLineWidth = width - (startX * 2); 

 
  let paragraphs = rawTxt.split('\n');
  let finalLines = [];

  for (let para of paragraphs) {
    let words = para.split(' ');
    let currentLine = "";

    for (let word of words) {
      let testLine = currentLine === "" ? word : currentLine + " " + word;
      let bbox = font.textBounds(testLine, 0, 0, fontSize);
      
      if (bbox.w > maxLineWidth && currentLine !== "") {
        finalLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine !== "") {
      finalLines.push(currentLine);
    }
  }

  for (let i = 0; i < finalLines.length; i++) {
    let currentLineText = finalLines[i];
    
    let currentLineY = baseStartY + (i * lineSpacing);

    let textPoints = font.textToPoints(currentLineText, startX, currentLineY, fontSize, { sampleFactor: 0.5 });
    
    for (let pt of textPoints) {
      points.push({ baseX: pt.x, baseY: pt.y, currX: pt.x, currY: pt.y });
    }
  }
}

function resetPoints() {
  for (let p of points) {
    p.currX = p.baseX;
    p.currY = p.baseY;
  }
}

function draw() {
  background(217); 
  
  let maxDist = int(distortionSlider.value());
  let currentHorizontalPush = float(horizontalDistortionSlider.value());
  let currentVerticalPush = float(verticalDistortionSlider.value());

  fill(0, 14, 138); 
  noStroke();

  for (let p of points) {
    let d = dist(mouseX, mouseY, p.currX, p.currY);

    if (mouseIsPressed && d < maxDist) {
      let dx = p.currX - mouseX;
      let dy = p.currY - mouseY;
      p.currX += (dx / d) * 0.25 * currentHorizontalPush * pushStrength;
      p.currY += (dy / d) * 0.25 * currentVerticalPush * pushStrength;
    }

    if (isReverting) {
      p.currX = lerp(p.currX, p.baseX, 0.05);
      p.currY = lerp(p.currY, p.baseY, 0.05);
    }

    circle(p.currX, p.currY, 4);
  }
}

let isCanvasEmpty = true;