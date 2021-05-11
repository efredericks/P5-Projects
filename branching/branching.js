//https://openprocessing.org/sketch/65382/#

let speed;
let numBranches;
let fgcolor;
let bgcolor;
let branches = [];

let toggle;
let ATTEMPT;

let Branch = function (angle) {
  this.rad = -1;
  this.strokeW = -1;
  this.alph = -1;
  this.xmargin = -1;
  this.ymargin = -1;
  
  this.n = 0;
  this.t = 0;
  this.prev = createVector();
  this.pos = createVector();
  this.angle = angle;
  this.numgenerations = int(random(3200, 7800));

  this.max_xmargin = random(120, 240);
  this.max_ymargin = random(120, 240);
  this.max_radius = random(350, 400);
  this.max_strokewidth = random(4, 8);

  this.noisex = random(10);
  this.noisey = random(10);
  
  this.draw = function(gfx, num, fg, bg) {
    for (let i = 0; i < speed; i++) {
      this.t = map(this.n, 0, this.numgenerations, 0, 1);
      if (this.t < 1.0) {
        this.rad = lerp(0, this.max_radius, this.t);
        this.alph = lerp(20, 0, this.t);
        this.strokeW = lerp(this.max_strokewidth, 0, this.t);
        this.xmargin = lerp(0, this.max_xmargin, this.t);
        this.ymargin = lerp(0, this.max_ymargin, this.t);
        this.pos.x = this.rad * cos(this.angle) + this.xmargin * (noise(this.noisex) - 0.5);
        this.pos.y = this.rad * sin(this.angle) + this.ymargin * (noise(this.noisey) - 0.5);
        
        if (num == 1)
          gfx.stroke(fg, this.alph); // [1] black on white
        else if ((num == 2) || (num == 3)) {
          // [2] white on progressive grays
          let col = map(this.n, 0, this.numgenerations, 255, 0);
          gfx.stroke(color(col,col,col));
        } else {
          // [4] progressive color
          let col = map(this.n, 0, this.numgenerations, 255, 0);
          if (this.n < (this.numgenerations/6)) {
            gfx.stroke(color(col,col,0,this.alph));
          
          // } else if (this.n < (this.num_generations/2)) {
          //   stroke(color(255,0,0,this.alph));//,this.alph));
          // } else {
          //  stroke(color(col,col,col,this.alph));  
          } else if (this.n < (this.numgenerations/3)) {
            gfx.stroke(color(0,0,col,this.alph));
          } else {
            gfx.stroke(color(col,col,col,this.alph));
          }
        }
        
        gfx.strokeWeight(this.strokeW);
        gfx.line(this.prev.x, this.prev.y, this.pos.x, this.pos.y);
        
        this.noisex += 0.001;
        this.noisey += 0.001;
        this.prev = this.pos;
        this.n++;
      }
    }
  };
};


let cv = function(num, fgcolor, bgcolor) {
  this.num = num;
  this.fgcolor = fgcolor;
  this.bgcolor = bgcolor;
  this.branches = [];
  
  this.addBranch = function(branch) {
    this.branches.push(branch);
  }
}
let canvases;

function setup() {
  ATTEMPT = 4;
  speed = 5;
  numBranches = 120;
  fgcolor = 0;
  toggle = false;
  canvases = [];
  
  let _c1 = new cv(1, 0, 255);
  let _c2 = new cv(2, 0, 120);
  let _c3 = new cv(3, 0, 255);
  let _c4 = new cv(4, 0, 0);
  
  smooth();
  createCanvas(600,600);//windowWidth,windowHeight);//800, 800);
  
  background(0);
  
  for (let i = 0; i < numBranches; i++) {
     let base_angle = map(i, 0, numBranches, 0, TWO_PI);
     //branches[i] = new Branch(base_angle);
    
    _c1.addBranch(new Branch(base_angle));
    _c2.addBranch(new Branch(base_angle));
    _c3.addBranch(new Branch(base_angle));
    _c4.addBranch(new Branch(base_angle));
  }
  canvases.push(_c1);
  canvases.push(_c2);
  canvases.push(_c3);
  canvases.push(_c4);
  
  noStroke();
  fill(_c1.bgcolor);
  rect(0,0,width/2,height/2);
  fill(_c2.bgcolor);
  rect(width/2,0,width,height);
  fill(_c3.bgcolor);
  rect(0,height/2,width/2,height);
  fill(_c4.bgcolor);
  rect(width/2,height/2,width/height);
  
  
//   switch (ATTEMPT) { 
//     case 1:
//     case 3:
//       bgcolor = 255; // [1] black on white
//       break;
//     case 4:
//       bgcolor = 0;
//       break;
//     case 2:
//     default:
//       bgcolor = 120;  // [2] white on gray
//       break;
//   }
  
//   smooth();
//   createCanvas(600, 600);
//   background(bgcolor);

//   for (let i = 0; i < numBranches; i++) {
//     let base_angle = map(i, 0, numBranches, 0, TWO_PI);
//     branches[i] = new Branch(base_angle);
//   }
}


//do a 4x4 set?
function draw() {
  for (let canv = 0; canv < canvases.length; canv++) {
    let c = canvases[canv];
    let gfx = createGraphics(width/2, height/2);
    
    gfx.fill(c.bgcolor);
    gfx.noStroke();
    gfx.translate((width/2)/2, (height/2)/2);
    for (let i = 0; i < numBranches; i++) {
      c.branches[i].draw(gfx, c.num, c.fgcolor, c.bgcolor);
    }
    
    let _x, _y;
    if (canv == 0) {
      _x = 0;
      _y = 0;
    } else if (canv == 1) {
      _x = width/2;
      _y = 0;
    } else if (canv == 2) {
      _x = 0;
      _y = height/2;
    } else {
      _x = width/2;
      _y = height/2;
    }
      
    image(gfx, _x, _y);
  }
  /*
  fill(bgcolor);
  noStroke();
  translate(width/2, height/2);
  for (let i = 0; i < numBranches; i++) {
    branches[i].draw();
  }*/
}

function mousePressed() {
  toggle = !toggle;
  
  if (!toggle)
    noLoop();
  else
    loop();
}
