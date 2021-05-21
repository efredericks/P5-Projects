// Original Calvin and Hobbes strip: https://www.gocomics.com/calvinandhobbes/1991/04/14
// Modified image: http://i.imgur.com/ZrlSb.png
// Starfield based on: https://codeburst.io/sunsets-and-shooting-stars-in-p5-js-92244d238e2b
// Shooting star based on: https://openprocessing.org/sketch/510610

// Script modified by Erik Fredericks

let orig_img,img;
let color1, color2;
let stars;
let numStars;

// background gradient
function setGradient(x, y, w, h, c1, c2, axis) {
  noFill();

  if (axis == "Y") {
    // top to bottom
    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x + w, i);
    }
  } else {
    // left to right
    for (let i = x; i <= x + w; i++) {
      let inter = map(i, x, x + w, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(i, y, i, y + h);
    }
  }
}

function Star() {
  this.x = random(width);
  this.y = random(height - 100);

  this.w = 2;
  this.h = 2;

  this.color = color(200, 200, 200, random(50, 255));
}
Star.prototype.draw = function () {
  noStroke();
  fill(this.color);
  ellipse(this.x, this.y, this.w, this.h);

  // twinkle twinkle
  if (random() > 0.98) {
    if (this.w == 2) {
      this.w = 3;
      this.h = 3;
    } else {
      this.w = 2;
      this.h = 2;
    }
    this.color = color(200, 200, 200, random(50, 255));
  }
};

function initializeGradient() {
  color1 = color(0, 0, random(153));
  color2 = color(0, 0, 0);
}

function initializeStars() {
  numStars = random(200, 1000);
  stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push(new Star());
  }
}

function mousePressed() {
  initializeGradient();
  initializeStars();
}

function preload() {
  orig_img = loadImage("calvin-and-hobbes-transparent.png");
  img = loadImage("calvin-and-hobbes-transparent.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);//2048, 1152);

  initializeGradient();
  initializeStars();

  frameRate(20);
}

function draw() {
  background(0);

  // night sky gradient
  setGradient(0, 0, width, height, color1, color2, "Y");

  // stars
  stars.forEach((elem) => elem.draw());

  // draw/scale image
  let h = img.height*width/img.width;
  imageMode(CORNER);
  image(img, 0, height-h, width, h); // to fit width
}
