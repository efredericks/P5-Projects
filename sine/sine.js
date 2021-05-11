// https://p5js.org/examples/math-sine-wave.html

// Modified to be oddly satisfying

let xspacing = 16; // Distance between each horizontal location
let w; // Width of entire wave
let theta = 0.0; // Start angle at 0
let amplitude = 75.0; // Height of wave
let period = 500.0; // How many pixels before the wave repeats
let dx; // Value for incrementing x
let yvalues; // Using an array to store height values for the wave
let fps = 30;

let capturer;
let record;

let initial_y;

function setup() {
  createCanvas(960,540);//windowWidth, windowHeight);

  w = width + 16;
  dx = (TWO_PI / period) * xspacing;
  yvalues = new Array(floor(w / xspacing));

  // remap amplitude as ratio to window height
  amplitude = map(amplitude, 0, 350, 0, windowHeight);

  // Create a capturer that exports PNG images in a TAR file
  capturer = new CCapture( { format: 'webm', framerate: fps } );
  //capturer.start();
  //record = true;
  frameRate(fps);
}

function keyReleased() {
  /*
  if (key == "r")
    record = !record;

  if (!record)
    capturer.save();
    */
}

function draw() {
  if (frameCount === 1)
    capturer.start();

  background(0);
  calcWave();
  renderWave();



  //if (record)
  capturer.capture( document.getElementById("defaultCanvas0") );

  if (frameCount === 1)
    initial_y = yvalues[0];

  //if ((frameCount > 1) && ((initial_y >= (yvalues[0]-.5)) && (initial_y <= (yvalues[0]+.5))))
  if (frameCount == (yvalues.length*6)) {
    capturer.save();
    //capturer.stop();
  }
//    console.log(initial_y, yvalues[0]);
}

function calcWave() {
  // Increment theta (try different values for
  // 'angular velocity' here)
  theta += 0.02;
  
  // For every x value, calculate a y value with sine function
  let x = theta;
  for (let i = 0; i < yvalues.length; i++) {
    yvalues[i] = sin(x) * amplitude;
    x += dx;
  }
}

function renderWave() {
  noStroke();
  fill(255);
  
  // A simple way to draw the wave with an ellipse at each location
  for (let x = 0; x < yvalues.length; x++) {
    let s1;
    let s2;
    
    if ((x % 2) == 0) {
      s1 = 1;
      s2 = 5;
    } else {
      s1 = 5;
      s2 = 1;
    }
    
    // avoid re-calculating
    let _x = x*xspacing;
    
    // top line
    strokeWeight(s1);
    stroke(map(x,0,yvalues.length,255,0));
    line(_x,height/2+yvalues[x],_x,0);
    
    // bottom line
    stroke(map(x,0,yvalues.length,0,255));
    strokeWeight(s2);
    line(_x,height/2+yvalues[x],_x,height);
    
    // circle
    stroke(0);
    strokeWeight(1);
    ellipse(_x, height / 2 + yvalues[x], 8, 8);
    
  }
}