// Erik Fredericks - 2021
// Gameplay based on the classic Fishy flash game
// Color palette: https://www.color-hex.com/color-palette/103536
// Blobby: https://thecodingtrain.com/CodingChallenges/036-blobby.html

//TBD:
// * radius is actually diameter -- precalculate and update

// Generic entity
class Entity {
  constructor() {
    this.yoff = 0.0;
    // ensure all don't blob the same
    this.offRand = createVector(random(50000), random(50000));
    this.radius = int(random(3, 100));
    // this.position = createVector(int(random(width)), int(random(height)));

    if (random() > 0.5) {
      this.velocity = createVector(random(-1.0, 0.2), 0);
      this.position = createVector(
        random(width + this.radius, width + this.radius + 500),
        random(height)
      );
    } else {
      this.velocity = createVector(random(0.2, 1.0), 0);
      this.position = createVector(
        random(-this.radius, -this.radius - 500),
        random(height)
      );
    }
    this.color = eg;
  }

  // update position, boundaries, sizing, etc.
  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // update all entities that are not the player
    if (!this.isPlayer) {
      // bounds wrapping
      if (this.velocity.x < 0) {
        // left bound
        if (this.position.x + this.radius < 0) {
          this.position.x = width + this.radius + random(150);
          this.radius = random(3, 100);
          this.position.y = random(this.radius, height - this.radius);
        }
      } else {
        // right bound
        if (this.position.x - this.radius > width) {
          this.position.x = -this.radius + random(-150);
          this.radius = random(3, 100);
          this.position.y = random(this.radius, height - this.radius);
        }
      }
    } else {
      // easy way to stay in-bounds
      // this.position.x = constrain(this.position.x, this.radius/2, width-this.radius/2);
      // this.position.y = constrain(this.position.y, this.radius/2, height-this.radius/2);
      // easing
      if (this.veloTimer.x > 0) {
        this.veloTimer.x--;
      } else {
        this.veloTimer.x = 0;
        this.velocity.x = 0;
      }

      if (this.veloTimer.y > 0) {
        this.veloTimer.y--;
      } else {
        this.veloTimer.y = 0;
        this.velocity.y = 0;
      }

      if (this.growTimer > 0) {
        this.radius += this.growTarget / 10;
        this.growTimer--;
      } else {
        this.growTimer = 0;
        this.growTarget = 0;
      }
    }
  }

  // draw each entity
  draw() {
    push();
    // blobby-ize this
    noStroke();
    translate(this.position.x, this.position.y);
    beginShape();
    fill(this.color);
    let xoff = 0;
    for (let a = 0; a < TWO_PI - PI / 30; a += (2 * PI) / 30) {
      let offset = map(
        noise(xoff + this.offRand.x, this.yoff + this.offRand.y),
        0,
        1,
        -this.radius / 4,
        this.radius / 4
      );
      let r = this.radius / 2 + offset;
      let x = r * cos(a);
      let y = r * sin(a);
      vertex(x, y);
      xoff += 0.1;
    }
    endShape();
    this.yoff += 0.01;
    // noStroke();
    // fill(this.color);
    // circle(this.position.x, this.position.y, this.radius);
    pop();
  }
}

// Circle-Circle collision
function circleCircle(e1, e2) {
  let d = dist(e1.position.x, e1.position.y, e2.position.x, e2.position.y);

  if (d < e1.radius / 2 + e2.radius / 2) return true;
  else return false;
}

// globals
let entities = [];
let numEntities = 10;
let player;

let bg;
let pg;
let eg;

let STATE;
let STATES = {
  start: 0,
  running: 1,
  paused: 2,
  gameOver: 3,
  win: 4,
};

// re-initialize everything as needed
function setupGame() {
  entities = [];
  player = null;
  bg = color(60, 35, 92);
  pg = color(187, 28, 203);
  eg = color(212, 148, 147);

  for (let i = 0; i < numEntities; i++) entities.push(new Entity());

  player = new Entity();
  player.radius = 0;
  player.color = pg; //color(255, 0, 255);
  player.isPlayer = true;
  player.position.x = width / 2;
  player.position.y = height / 2;
  player.velocity.x = 0;
  player.velocity.y = 0;
  player.veloTimer = createVector(0, 0);

  // chunk into X steps for eased growing
  player.growTimer = 30;
  player.growTarget = 5;

  STATE = STATES.running;
}

function setup() {
  createCanvas(640, 480);
  frameRate(60);
  setupGame();

  STATE = STATES.start;

  // add some extra entities for the splash
  for (let i = 0; i < numEntities; i++) entities.push(new Entity());
}

function draw() {
  background(bg);

  if (STATE === STATES.start) {
    entities.forEach((e) => {
      e.update();
      e.draw()
    });

    fill(color(0, 0, 0, 180));
    rect(0, 0, width, height);

    textSize(32);
    fill(255);
    textAlign(CENTER, CENTER);

    text("feesh", width / 2, height / 2);

    textSize(16);
    text("Movement: Arrow keys // Pause: Space", width / 2, height / 2 + 24);
    text("Press any key to start", width / 2, height / 2 + 44);

  } else {
    if (STATE === STATES.running) {
      // update floaters
      entities.forEach((e) => e.update());

      // handle continuous keypresses
      if (keyIsDown(LEFT_ARROW)) {
        player.velocity.x += -0.25;
        player.veloTimer.x = 10;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        player.velocity.x += 0.25;
        player.veloTimer.x = 10;
      }
      if (keyIsDown(UP_ARROW)) {
        player.velocity.y += -0.25;
        player.veloTimer.y = 10;
      }
      if (keyIsDown(DOWN_ARROW)) {
        player.velocity.y += 0.25;
        player.veloTimer.y = 10;
      }

      // cap velocity
      player.velocity.x = constrain(player.velocity.x, -3.5, 3.5);
      player.velocity.y = constrain(player.velocity.y, -3.5, 3.5);

      // update player
      player.update();

      // collisions
      for (let i = entities.length - 1; i >= 0; i--) {
        if (circleCircle(player, entities[i])) {
          // player bigger than entity
          if (player.radius >= entities[i].radius) {
            player.growTimer = 10;
            player.growTarget = entities[i].radius / 2;

            entities.splice(i, 1);
            entities.push(new Entity()); // add a new one back

            if (player.radius > width) STATE = STATES.win;

            // player smaller than entity
          } else {
            player.color = color(255, 0, 0);
            STATE = STATES.gameOver;
          }
        }
      }
    }

    // draw entities
    entities.forEach((e) => e.draw());
    player.draw();

    // you lost
    if (STATE === STATES.gameOver || STATE === STATES.win) {
      fill(color(0, 0, 0, 180));
      rect(0, 0, width, height);

      textSize(32);
      fill(255);
      textAlign(CENTER, CENTER);

      let txt = "YOU DIED";
      if (STATE === STATES.win) txt = "YOU WON";
      text(txt, width / 2, height / 2);

      textSize(16);
      text(`Final size: ${int(player.radius)}`, width / 2, height / 2 + 24);
      text("Press any key to restart", width / 2, height / 2 + 44);
    }
  }
}

// handle async keypresses
function keyPressed() {
  // restart game if done
  if (STATE === STATES.gameOver || STATE === STATES.win || STATE === STATES.start) {
    setupGame();
  } else {
    if (key === " ") {
      if (STATE === STATES.running) STATE = STATES.paused;
      else STATE = STATES.running;
    }
  }
}