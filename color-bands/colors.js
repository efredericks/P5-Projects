// particle based on the p5js example:
// https://p5js.org/examples/simulate-particle-system.html
let Particle = function (pos, col) {
  this.acceleration = createVector(random(-0.015, 0.015), 0);
  this.velocity = createVector(random(-1, 1), 0);
  this.position = pos.copy();
  this.col = col;
  this.angle = 0;

  this.update = function () {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.draw();

    if (this.position.x > width || this.position.x < 0) {
      this.position.x = random(width);
      this.velocity.x *= -1;
    }
    if (this.position.y > height || this.position.y < 0) {
      this.position.y = random(height);
      this.velocity.y *= -1;
    }

    if (random() > 0.9) this.position.y += random(-2, 2);
  };

  this.draw = function () {
    stroke(this.col);
    point(this.position);
  };

  // smarten up this  later
  this.angulate = function () {
    this.angle++;
    if (this.angle > 2) this.angle = 0;

    switch (this.angle) {
      case 0: // horizontal
        this.acceleration = createVector(random(-0.015, 0.015), 0);
        this.velocity = createVector(random(-1, 1), 0);
        break;
      case 1: // diagonal
        this.acceleration = createVector(
          random(-0.015, 0.015),
          random(-0.015, 0.015)
        );
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        break;
      case 2: // vertical
      default:
        this.acceleration = createVector(0, random(-0.015, 0.015));
        this.velocity = createVector(0, random(-1, 1));
        break;
    }
  };
};
let particles = [];

let colorIndex = 0;
let colors = [
  // https://www.color-hex.com/palettes/61235.png
  ["#711c91", "#ea00d9", "#08bdc6", "#133e7c", "#091833"],
  // https://www.color-hex.com/color-palette/110697
  ["#017664", "#152228", "#e7eee7", "#102568", "#d31717"],
  // https://www.color-hex.com/color-palette/110682
  ["#80ced7", "#531cb3", "#844bbb", "#3c91e6", "#75b9be"],
];

let paused = false;

function createBands() {
  let bands = [];
  let rows = Math.floor(height / colors[colorIndex].length);
  for (let i = 0; i < colors[colorIndex].length; i++) bands[i] = i * rows;

  let offset = 0;
  let num_pixels = 10;

  for (let r = 0; r < height / 0.5; r++) {
    let h = offset; //random(height);
    let col = colors[colorIndex][0];

    for (let b = bands.length - 1; b >= 0; b--) {
      if (h > bands[b]) {
        indx = b;
        break;
      }
      col = colors[colorIndex][b];
    }

    let np = map(r, height / 0.5, 0, 1, 25);
    for (let i = 0; i < np; i++) {
      particles.push(new Particle(createVector(random(width), h), col));
    }
    offset += 0.5;
  }
}
function setup() {
  createCanvas(windowWidth, windowHeight);//640, 480);

  createBands();
  frameRate(60);
}

function keyPressed() {
  if (key == " ") background(0);
  if (key == "p") paused = !paused;
  if (paused) noLoop();
  else loop();
}

function draw() {
  //background(0);
  particles.forEach((elem) => elem.update());

  if (frameCount % 200 == 0) {
    colorIndex++;
    if (colorIndex > colors.length - 1)
      colorIndex = 0;
    
    particles.forEach((elem) => elem.angulate());
  }
   if (frameCount % 400 == 0) {
  // if (random() > 0.99) {
  // if (frameCount % 50 == 0) {
    particles = [];
    createBands();
  }
}
