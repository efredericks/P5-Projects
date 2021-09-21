//https://tylerxhobbs.com/essays/2020/flow-fields

let d;

let left_x, right_x;
let top_y, bottom_y;
let resolution;
let num_columns, num_rows;
let default_angle;
let grid;

let pink, black;
let imgSize;

let x, y, step, num_steps;
let vertices;

let maxestStep;
let constAngle;
let colorBands;

let paused;
let _x_bound;
let _y_bound;

let num_lines;
let currentBG;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getPixelLocation(row, col) {
  return row * num_columns + col;
}

function initGrid() {
  let off_x = random(50000);
  let off_y = random(50000);
  constAngle = random(0, 2 * PI);

  // initialize grid
  let _grid = new Array(num_columns);
  for (let col = 0; col < _grid.length; col++) {
    _grid[col] = new Array(num_rows);
    for (let row = 0; row < _grid[col].length; row++) {
      //grid[col][row] = default_angle;
      //angle = (row / float(num_rows)) * PI;
      let scaled_x = col * 0.005;
      let scaled_y = row * 0.005;
      let noise_val = noise(scaled_x + off_x, scaled_y + off_y);
      //angle = random(0,2*PI);

      // flow field
      angle = map(noise_val, 0.0, 1.0, 0.0, PI * 2.0);

      // comment below to make a 'pure' flow field
      // // "split" presentation
      // if (angle < PI) angle = constAngle;//0;
      // else if (angle < ((3*PI)/2))
      //   angle = random(0, PI);
      // else
      //   angle = random(PI, 2 * PI);

      // branchy
      if (angle < PI) angle = random(0, PI);
      else angle = random(PI, 2 * PI);

      // multi-branchy
      // if (angle < (PI/2)) angle = random(0,PI/2);
      // else if (angle < PI) angle = random(PI/2,PI);
      // else if (angle < ((3*PI)/2)) angle = random (PI, (3*PI)/2);
      // else angle = random((3*PI)/2,2*PI);
      if (random() > 0.8) angle = random(0, 2 * PI);

      // catchall
      angle = constrain(angle, 0, 2 * PI);

      //       if (angle < (PI/2))
      //         angle = 0;
      //       else if (angle < PI)
      //         angle = PI/2;
      //       else if (angle < ((3*PI)/2))
      //         angle = PI/4;
      //       else
      //         angle = (3*PI)/2;

      _grid[col][row] = angle;
    }
  }
  return _grid;
}

function keyReleased() {
  if (key === " ") paused = !paused;

  if (key === "r") {
    paused = false;
    currentBG = color(random(255),random(255),random(255),255);
    background(currentBG);
    // fill(color(random(255)))
    // circle(width/2,height/2,100);
    grid = initGrid();
    vertices = initVertices();
    step = 0;
    drawCenter();
    // console.log("new FF");
    // noLoop();
  }
}

function initVertices() {
  let _vertices = [];
  // initialize lines
  let _len = num_lines;

  for (let i = 0; i < _len; i++) {
    let _obj = {
      // points: [createVector(random(width), random(height))],

      // centered
      // points: [createVector((width/2)+random(-100,100), (height/2)+random(-100,100))],
      points: [
        createVector(
          width / 2 + random(-_x_bound, _x_bound),
          height / 2 + random(-_y_bound, _y_bound)
        ),
      ],

      //color: color(random(255)), //random(255), random(255), random(255), 255),
      color: colorBands[getRandomInt(0, colorBands.length - 1)],
      weight: random(0.5, 3), //0.5,//random(1, 5),
      maxSteps: random(500, 2000),//rr1000),
      stepLength: 1, //random(1, 4),
    };
    _vertices.push(_obj);

    if (maxestStep < _obj.maxSteps) maxestStep = _obj.maxSteps;
  }

  return _vertices;
}

function drawCenter() {
  let _x1 = width / 2 - _x_bound;
  let _y1 = height / 2 - _y_bound;

  // strip
  // fill(color(0,0,0,200));
  // noStroke();
  // rect(0,(height/2)-500,width,1000);
  
  for (let i = 0; i < int(random(height/2,height)); i++) {
    let _c = color(colorBands[getRandomInt(0,colorBands.length)]);
    _c._array[3] = random(120, 200) / 255;
    stroke(_c);
    strokeWeight(random(0.5,2));
    let _y = random(height);
    // line(0,_y,width,_y);
    
    beginShape();
    curveVertex(-5,_y);
    
    let _amp = random(20);
    
    for (let j = 0; j < width; j += 5) {
      curveVertex(j, _y + random(-_amp,_amp));
    }
    curveVertex(width+5, _y);
    endShape();
  }
  
  // box
  let _c = color(colorBands[4]);
  _c._array[3] = random(120, 200) / 255;
  fill(_c); //color(116,66,200,random(120,200)));
  noStroke();
  rect(_x1, _y1, _x_bound * 2, _y_bound * 2);
}

function setup() {
  angleMode(RADIANS);

  paused = false;
  
  currentBG = color(255,255,255,255);

  createCanvas(7200, 7200);
  // createCanvas(1000, 1000);
  // createCanvas(400, 400);

  vertices = [];

  _x_bound = random(width / 2);
  _y_bound = random(height / 2);

  // 5 color test - https://www.colourlovers.com/palette/4831526/optie6ABL
  colorBands = [
    color("#D68046"),
    color("F2C9AD"),
    color("#B5CCDD"),
    color("#DBE0E3"),
    color("#698497"),
  ];

  step = 0;
  // num_lines = 1000;
  num_lines = 5000 * 7;

  // unchanging globals
  imgSize = 4 * (width * d) * (height * d);
  pink = color(255, 102, 204);
  black = color(0);

  left_x = int(width * -0.5);
  right_x = int(width * 1.5);
  top_y = int(height * -0.5);
  bottom_y = int(height * 1.5);

  resolution = int(width * 0.01);

  num_columns = (right_x - left_x) / resolution;
  num_rows = (bottom_y - top_y) / resolution;

  default_angle = PI * 0.25;

  maxestStep = -1;

  grid = initGrid();
  vertices = initVertices();

  //background(50);
  //background(random(255), random(255), random(255));
  background(color(255));

  drawCenter();
  // console.log(vertices[0])

  // fill(color(random(255)))
  // circle(width/2,height/2,100);
}

// function drawCircles() {
//   // let _c = color(colorBands[4]);
//   // _c._array[3] = random(120, 200) / 255;
  
//   fill(currentBG);//color(255,255,255,255));
//   noStroke();
  
//   for (let i = 0; i < int(random(1,10)); i++)
//     circle((width / 2) + random(-_x_bound/2,_x_bound/2), (height / 2) + random(-_y_bound/2,_y_bound/2), random(20, _x_bound));
// }

function draw() {
  //background(0)
  if (!paused) {
    for (let i = 0; i < vertices.length; i++) {
      if (step < vertices[i].maxSteps && step < vertices[i].points.length) {
        let _x = vertices[i].points[step].x;
        let _y = vertices[i].points[step].y;

        beginShape(POINTS);
        strokeWeight(vertices[i].weight);

        //       if (_x <= width/5)
        //         stroke(colorBands[0]);
        //       else if (_x <= 2*(width/5))
        //         stroke(colorBands[1]);
        //       else if (_x <= 3*(width/5))
        //         stroke(colorBands[2]);
        //       else if (_x <= 4*(width/5))
        //         stroke(colorBands[3]);
        //       else
        //         stroke(colorBands[4]);

        stroke(vertices[i].color);
        vertex(_x, _y);
        endShape();

        let x_offset = _x - left_x;
        let y_offset = _y - top_y;

        let column_index = int(x_offset / resolution);
        let row_index = int(y_offset / resolution);

        column_index = constrain(column_index, 0, grid.length);
        row_index = constrain(row_index, 0, grid[0].length);

        if (
          column_index < grid.length &&
          row_index < grid[column_index].length
        ) {
          let grid_angle = grid[column_index][row_index];

          let x_step = vertices[i].stepLength * cos(grid_angle);
          let y_step = vertices[i].stepLength * sin(grid_angle);

          _x += x_step; // + random(-1.5, 1.5);
          _y += y_step; // + random(-1.5, 1.5);

          // track alpha instead?
          // if ((((_x - (width/2))**2) + ((_y - (height/2))**2)) >= 2500)
          vertices[i].points.push(createVector(_x, _y));
          // else
          //   vertices[i].points.push(createVector(-100,-100));
        }
      }
    }
    step++;

    if (step >= maxestStep) {
      // drawCircles();
      paused = true;
      console.log("done - space to restart");
    }
  }
}
