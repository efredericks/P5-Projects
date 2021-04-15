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
let pause;

let col_chkbox;
let bezier_chkbox;

function keyPressed() {
  if (key == "r")
    restart = true;
  else if (key == "p")
    pause = !pause;
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

    points.push({ 'x1': _x1, 'y1': _y1, 'x2': _x2, 'y2': _y2 });
  }

  restart = false;
  pause = false;
}

function setup() {
  createCanvas(640, 480);

  col_chkbox = createCheckbox("Randomize Colors?", false);
  bezier_chkbox = createCheckbox("Bezier Curves?", false);

  pause = false;
  restart = false;
  r = height * 0.45;
  restartDrawing();
}

function draw() {
  if (!pause) {
    fill(0)
    noStroke();
    rect(0, 0, 190, 40);
    fill(255);
    textSize(14);
    text("[r]estart/[p]ause - " + current_index + "/" + points.length, 10, 20);

    translate(width / 2, height / 2);

    if (!restart) {
      let _col = color(128, 128, 128);

      if (col_chkbox.checked())
        _col = color(getRandomInt(0, 256), getRandomInt(0, 256), getRandomInt(0, 256));
      stroke(_col);
      strokeWeight(getRandomInt(1, 4));

      if (!bezier_chkbox.checked())
        line(points[current_index]['x1'],
          points[current_index]['y1'],
          points[current_index]['x2'],
          points[current_index]['y2']);
      else
        bezier(
          points[current_index]['x1'], points[current_index]['y1'],
          points[current_index]['x1'] + getRandomInt(0, 50), points[current_index]['y1'] - getRandomInt(0, 50),
          points[current_index]['x2'] - getRandomInt(0, 50), points[current_index]['y2'] + getRandomInt(0, 50),
          points[current_index]['x2'], points[current_index]['y2']);

      current_index++;
      if (current_index >= points.length) {
        restartDrawing();
      }
    } else {
      restartDrawing();
    }
  }
}