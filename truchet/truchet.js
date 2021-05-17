// Truchet Halftone Visualization
// Based on https://openprocessing.org/sketch/202902
// Modified by Erik Fredericks
let sTile = 19;
let m;
let c0;
let c1;
let hideLogo = true;
let hideDrawing = false;
let recordFrames = false;
let pause = false;
let logo;
let logoSizes = new Array();
let capturer;
let div;
let bg_color;

let CANVAS_WIDTH;
let CANVAS_HEIGHT;

// Generate the random colors used throughout
function newColor() {
  c0 = color(random(255), random(255), random(255));
  c1 = color(random(255), random(255), random(255));
}

// Redo the pattern
function newPattern() {
  m = [];
  let _w = (int)(width / sTile) + 1;
  let _h = (int)(height / sTile) + 1;
  m = Array(_h).fill().map(() => Array(_w));

  for (let _y = 0; _y < height; _y += sTile) {
    for (let _x = 0; _x < width; _x += sTile) {
      m[(int)(_y / sTile)][(int)(_x / sTile)] = int(random(2));
    }
  }
}

// Draw the pattern (i.e., the heart of this algorithm)
// Smooth added to try and remove the pixelated look that ellipses are giving
function drawPattern() {
  for (let _x = 0; _x < width; _x += sTile) {
    for (let _y = 0; _y < height; _y += sTile) {
      if (m[(int)(_y / sTile)][(int)(_x / sTile)] == 0)
        fill(c0);
      else
        if (!hideDrawing) {
          smooth();
          rect(_x, _y, sTile, sTile);
          noSmooth();
        }
    }
  }

  for (let _x = 0; _x < width; _x += sTile) {
    for (let _y = 0; _y < height; _y += sTile) {
      let s = 0;
      if (((_x + _y) % 2) == 0) {
        fill(c0);
        s = -1;
      } else {
        fill(c1);
        s = 1;
      }

      let d = map(noise(_x / 320., _y / 320., frameCount / 100.), 0.33, 0.66, -sTile / 2, sTile / 2);
      if (!hideDrawing) {
        smooth();
        ellipse(_x, _y, sTile + s * d, sTile + s * d);
        noSmooth();
      }

      if (!hideLogo) {
        let indx = (int)(map(d, -sTile / 2, sTile / 2, 0, logoSizes.length - 1, true));
        image(logoSizes[indx], _x, _y);// _x - (sTile+s*d)/2, _y - (sTile+s*d)/2);// _x-d, _y-d);
      }
    }
  }
}
function mouseReleased() {
  if (mouseButton == LEFT) {
    newColor();
    noiseSeed();
  }
  newPattern();
  if (pause)
    redraw();
}
function keyPressed() {
  if (key == ' ')
    pause = !pause;
  if (key == 'l')
    hideLogo = !hideLogo;
  if (key == 'd')
    hideDrawing = !hideDrawing;
  if (key == 'S' || key == 's') {
    recordFrames = !recordFrames;

    /* TBD - janky atm
    if (recordFrames)
      capturer.start()
    else {
      capturer.stop();
      capturer.save();
    }
    */
  }

  if (!pause)
    loop();
}

function preload() {
  logo = loadImage("gvsu-circle-75.png"); // tint is ridiculously slow, pre-alpha the img

  // pre-render image at varying sizes
  for (let _i = 0; _i < sTile * 2; _i++) {
    let _img = loadImage("gvsu-circle-75.png");
    logoSizes.push(_img);
  }
}

function setup() {
  randomSeed(1);

  div = createDiv();
  CANVAS_WIDTH = windowWidth;
  CANVAS_HEIGHT = windowHeight;
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  bg_color = color(255);
  noStroke();

  let _w = (int)(width / sTile) + 1;
  let _h = (int)(height / sTile) + 1;

  // resize images here to prevent run-time resizing
  for (let _i = 0; _i < sTile * 2; _i++) {
    logoSizes[_i].resize(_i + 1, 0);
  }
  m = Array(_h).fill().map(() => Array(_w));

  // Create a capturer that exports a WebM video
  // capturer = new CCapture( {  format: 'webm',  framerate: 60,  name: 'truchet_visualization',  quality: 100,} );

  newColor();
  newPattern();
}

function draw() {
  div.html("Framecount: " + frameCount);

  background(bg_color);
  if (pause)
    noLoop();
  drawPattern();

  /* TBD - janky atm
  if (recordFrames)
    capturer.capture(document.getElementById('defaultCanvas0'));
  */

  // loadPixels();
  // for (let i = 0; i < (width * height); i++) {
  //   //let _shift = random(-30, 30);
  //   rv = red(pixels[i]) + random(-30, 30);// _shift;
  //   bv = blue(pixels[i]) + random(-30, 30);// _shift;
  //   gv = green(pixels[i]) + random(-30, 30);// _shift;

  //   rv = max(0, min(rv, 255));
  //   gv = max(0, min(gv, 255));
  //   bv = max(0, min(bv, 255));

  //   pixels[i] = color(rv, gv, bv);
  // }
  // updatePixels();


  // noLoop();
  if ((frameCount % 100) == 0) {
    hideDrawing = !hideDrawing;
    hideLogo = !hideLogo;

    if (!hideDrawing) {
      newColor();
      noiseSeed();
    }

    bg_color = color(random(255), random(255), random(255));
  }
}