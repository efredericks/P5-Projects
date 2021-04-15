// Just a whole buncha lines drawn around a circle

// Just a whole buncha lines drawn around a circle

// thanks mozilla i always forget this one:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

let points = [];
let num_lines = 1000;

let theta_vel;
let current_index = 0;
let r;
let restart;

function mousePressed() {
  restart = true;
}

function restartDrawing() {
  background(0);
  current_index = 0;
  points = [];
  
  // create points to draw lines around circle
  for (let _i = 0; _i < num_lines; _i++) {
    let _theta1 = random() * TWO_PI;
    let _theta2 = random() * TWO_PI;
    
    let _x1 = r * cos(_theta1);
    let _x2 = r * cos(_theta2);
    
    let _y1 = r * sin(_theta1);
    let _y2 = r * sin(_theta2);
    
    points.push({'x1':_x1, 'y1':_y1,'x2':_x2,'y2':_y2});
    
    // Test without animation
    //stroke(155);
    //line(_x1, _y1, _x2, _y2);
  }
  
  restart = false;
}

function setup() {
  createCanvas(640, 480);
  restart = false;
  r = height * 0.45;
  restartDrawing();
}

function draw() {
  fill(0)
  noStroke();
  rect(0,0,150,40);
  fill(255);
  textSize(14);
  text(current_index + "/" + points.length, 10, 20);

  translate(width / 2, height / 2);
  
  if (!restart) {
    stroke(155);
    strokeWeight(getRandomInt(1,4));
    line(points[current_index]['x1'],
         points[current_index]['y1'],
         points[current_index]['x2'],
         points[current_index]['y2']);

    current_index++;
    if (current_index >= points.length) {
      restartDrawing();
    }   
  } else {
    restartDrawing();
  }
}