// Just a whole buncha lines drawn around a circle

let points = [];
let num_lines = 1000;

let theta_vel;
let current_index = 0;
let r;

function setup() {
  createCanvas(640, 480);
  background(0);
  
  translate(width / 2, height / 2);
  r = height * 0.45;
  
  stroke(155);
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
    //line(_x1, _y1, _x2, _y2);
  }
}

function draw() {
  translate(width / 2, height / 2);
  
  line(points[current_index]['x1'],
       points[current_index]['y1'],
       points[current_index]['x2'],
       points[current_index]['y2']);
    
  current_index++;
  if (current_index >= points.length) {
    background(0);
    current_index = 0;
  }
}