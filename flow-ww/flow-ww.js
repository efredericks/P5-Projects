let paused;
let workers;
let particles;

class Particle {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = createVector(random(-2, 2), random(-2, 2));
    this.color = color(random(100, 255));
    this.diameter = random(.5, 2);
  }

  draw() {
    noStroke();
    fill(this.color);
    circle(this.position.x, this.position.y, this.diameter);
  }
}

function stripParticlesFxns(p, i, width, height) {
  return {
    position: { x: p.position.x, y: p.position.y },
    velocity: { x: p.velocity.x, y: p.velocity.y },
    id: i,
    width: width,
    height: height
  }
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function keyReleased() {
  if (key === " ") paused = !paused;

  if (key === "r") {
    paused = false;
    currentBG = color(random(255), random(255), random(255), 255);
    background(currentBG);
  }
}

function setup() {
  paused = false;
  workers = [];
  particles = [];

  let numWorkers = 100;
  let chunk = 200;
  // let numParticles = numWorkers * chunk;

  currentBG = color(120);//255,255,255,255);

  // createCanvas(7200, 7200);
  createCanvas(1000, 1000);
  frameRate(60);
  // createCanvas(400, 400);

  let _id = 0;
  for (let i = 0; i < numWorkers; i++) {
    let w = new Worker("worker.js");
    let msg = [];
    for (let j = 0; j < chunk; j++) {
      let p = new Particle();
      particles.push(p);
      let _p = stripParticlesFxns(p, _id, width, height);
      _id++;
      msg.push(_p);
    }
    w.postMessage(msg);
    // w.postMessage([p.position.x, p.position.y, p.velocity.x, p.velocity.y, width, height, i]);

    w.onmessage = (e) => {
      let _msg = [];
      for (let j = 0; j < e.data.length; j++) {
        let _p = particles[e.data[j].id];
        // console.log(e.data);
        _p.position.x = e.data[j].position.x;
        _p.position.y = e.data[j].position.y;
        _p.velocity.x = e.data[j].velocity.x;
        _p.velocity.y = e.data[j].velocity.y;
        let _p2 = stripParticlesFxns(_p, e.data[j].id, width, height);
        _msg.push(_p2);
      }
      const reply = setTimeout(() => w.postMessage(_msg), 100);
    };
    workers.push(w);
  }

  background(currentBG);
}

function draw() {
  if (!paused) {
    for (let i = 0; i < particles.length; i++)
      particles[i].draw();
  }
}
