// Original Calvin and Hobbes strip: https://www.gocomics.com/calvinandhobbes/1991/04/14
// Modified image: http://i.imgur.com/ZrlSb.png
// Starfield based on: https://codeburst.io/sunsets-and-shooting-stars-in-p5-js-92244d238e2b
// Shooting star based on: https://openprocessing.org/sketch/510610
// Image alignment/placement helped by: https://editor.p5js.org/L05/sketches/o1a4f6XpE

// Script modified by Erik Fredericks

let orig_img, img;
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
  this.y = random(height - 20);

  this.w = 2;
  this.h = 2;

  this.alpha = random(50, 255);

  this.shooting = false;
  this.color = color(200, 200, 200, this.alpha);
}
Star.prototype.draw = function () {
  noStroke();
  fill(this.color);
  ellipse(this.x, this.y, this.w, this.h);

  // shooting star
  if (this.shooting) {
    this.x += this.xoff;
    this.y += this.yoff;
    this.alpha -= 5;
  }

  // twinkle twinkle
  if (random() > 0.99) {
    if (this.w == 2) {
      this.w = 3;
      this.h = 3;
    } else {
      this.w = 2;
      this.h = 2;
    }
    this.alpha = random(50, 255);
    this.color = color(200, 200, 200, this.alpha);
  }

  if (this.x > width || this.x < -width || this.y > height || this.y < -height)
    return false;
  return true;
};
Star.prototype.shoot = function () {
  this.shooting = true;
  this.alpha = 255;
  this.w++;
  this.h++;
  this.xoff = random(-10, 10);
  this.yoff = random(-10, 10);
}

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

  frameRate(30);
}

function draw() {
  background(0);

  // night sky gradient
  setGradient(0, 0, width, height, color1, color2, "Y");

  // stars
  for (i = stars.length - 1; i >= 0; i--) {
    let retval = stars[i].draw();
    if (!retval)
      stars.splice(i, 1);
  }
  //stars.forEach(elem => updateStars(elem));
  if (frameCount % 400 == 0) {
    star = random(stars);
    star.shoot();
  }

  // draw/scale image
  let h = img.height * width / img.width;
  imageMode(CORNER);
  image(img, 0, height - h, width, h); // to fit width

  while (stars.length < numStars) {
    stars.push(new Star());
  }
}
