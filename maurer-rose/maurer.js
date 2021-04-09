// Maurer Rose
// Based on The Coding Train / Daniel Shiffman
//   . https://thecodingtrain.com/CodingInTheCabana/002-collatz-conjecture.html
//   . https://youtu.be/4uU9lZ-HSqA
//   . https://editor.p5js.org/codingtrain/sketches/qa7RiptE9

// Modified to be a bit trippier

let n = 0;
let d = 0;

let cols = [];
let strokes = [];
let num_shapes = 5;
let paused = false;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function setup() {
  createCanvas(600, 600);
  angleMode(DEGREES);

  // randomly add colors and stroke weights
  for (let i = 0; i < num_shapes; i++) {
    append(cols, color(getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255)));
    append(strokes, getRandomInt(1, 4));
  }
}

function mouseClicked() {
  paused = !paused;
}

function draw() {
  if (!paused) {
    background(0);
    translate(width / 2, height / 2);
    stroke(255);
    //d = dSlider.value();
    noFill();

    for (let p = 1; p < num_shapes + 1; p++) {

      beginShape();
      stroke(cols[p - 1]);

      strokeWeight(strokes[p - 1]);
      for (let i = 0; i < 361; i++) {
        let k = i * d;
        let r = 150 * sin(n * k);
        let x = r * p * cos(k);
        let y = r * p * sin(k);
        vertex(x, y);
      }
      endShape();
    }

    n += 0.001;
    d += 0.003;
  }
}