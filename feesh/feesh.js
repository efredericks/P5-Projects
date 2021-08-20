// Erik Fredericks - 2021
// Gameplay based on the classic Fishy flash game
// Color palette: https://www.color-hex.com/color-palette/103536
// Blobby: https://thecodingtrain.com/CodingChallenges/036-blobby.html

// TBD:
// * comment cleanup
// * offscreen culling optimization
// * difficulty selection

// Generic entity
class Entity {
  constructor() {
    this.cooldown = 0; // bounce cooldown

    this.yoff = 0.0; // blob parameter
    // ensure all don't blob the same
    this.offRand = createVector(random(50000), random(50000));
    this.diameter = int(random(3, 100));

    // randomly start its position/direction
    if (random() > 0.5) {
      this.velocity = createVector(random(-1.0, 0.2), 0);
      this.position = createVector(
        random(width + this.diameter, width + this.diameter + 500),
        random(height)
      );
    } else {
      this.velocity = createVector(random(0.2, 1.0), 0);
      this.position = createVector(
        random(-this.diameter, -this.diameter - 500),
        random(height)
      );
    }
    this.color = eg;
  }

  // only bounce if in bounds
  inBounds() {
    return ((this.position.x > 0) &&
      (this.position.x < width) &&
      (this.position.y > 0) &&
      (this.position.y < height))
  }

  // collision between entities occurred, bounce
  // https://p5js.org/examples/motion-bouncy-bubbles.html
  bounce(other) {
    this.cooldown = 5;

    let dx = other.position.x - this.position.x;
    let dy = other.position.y - this.position.y;

    let spring = 0.05;

    let distance = sqrt(dx * dx + dy * dy);
    let minDist = other.diameter / 2 + this.diameter / 2;
    let angle = atan2(dy, dx);
    let targetX = this.position.x + cos(angle) * minDist;
    let targetY = this.position.y + sin(angle) * minDist;
    let ax = (targetX - other.position.x) * spring;
    let ay = (targetY - other.position.y) * spring;
    this.velocity.x -= ax;
    this.velocity.y -= ay;
  }

  // update position, boundaries, sizing, etc.
  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // update all entities that are not the player
    if (!this.isPlayer) {
      // cooldown
      if (this.cooldown > 0)
        this.cooldown--;

      // bounds wrapping
      if (this.velocity.x < 0) {
        // left bound
        if (this.position.x + this.diameter < 0) {
          this.position.x = width + this.diameter + random(150);
          this.diameter = random(3, 100);
          this.position.y = random(this.diameter, height - this.diameter);
        }
      } else {
        // right bound
        if (this.position.x - this.diameter > width) {
          this.position.x = -this.diameter + random(-150);
          this.diameter = random(3, 100);
          this.position.y = random(this.diameter, height - this.diameter);
        }
      }
    } else {
      // easy way to stay in-bounds
      // this.position.x = constrain(this.position.x, this.diameter/2, width-this.diameter/2);
      // this.position.y = constrain(this.position.y, this.diameter/2, height-this.diameter/2);
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
        this.diameter += this.growTarget / 10;
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
        -this.diameter / 4,
        this.diameter / 4
      );
      let r = this.diameter / 2 + offset;
      let x = r * cos(a);
      let y = r * sin(a);
      vertex(x, y);
      xoff += 0.1;
    }
    endShape();
    this.yoff += 0.01;
    // noStroke();
    // fill(this.color);
    // circle(this.position.x, this.position.y, this.diameter);
    pop();
  }
}

// enable/disable entity bouncing
function bouncyBoxChanged() {
  if (this.checked()) {
    bouncy = true;
  } else {
    bouncy = false;
  }
}

// Circle-Circle collision
function circleCircle(e1, e2) {
  let d = dist(e1.position.x, e1.position.y, e2.position.x, e2.position.y);

  if (d < e1.diameter / 2 + e2.diameter / 2) return true;
  else return false;
}

// globals
let entities = [];
let numEntities = 20;
let player;

let bg;
let pg;
let eg;

let bouncyBox;
let bouncy;

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
  player.diameter = 0;
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
  let c = createCanvas(640, 480);
  c.parent('canvas-container');
  frameRate(60);
  setupGame();

  bouncyBox = createCheckbox('bouncy blobs?', true);
  bouncyBox.parent('controls');
  bouncyBox.changed(bouncyBoxChanged);
  bouncy = true;

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
          if (player.diameter >= entities[i].diameter) {
            player.growTimer = 10;
            player.growTarget = entities[i].diameter / 2;

            entities.splice(i, 1);
            entities.push(new Entity()); // add a new one back

            if (player.diameter > width) STATE = STATES.win;

            // player smaller than entity
          } else {
            player.color = color(255, 0, 0);
            STATE = STATES.gameOver;
          }
        }

        // let them BOUNCE
        if (bouncy) {
          for (let j = entities.length - 1; j >= 0; j--) {
            if (i == j) continue;

            if (circleCircle(entities[i], entities[j]) && entities[i].inBounds() && entities[j].inBounds()) {
              if (entities[i].cooldown == 0)
                entities[i].bounce(entities[j]);
              if (entities[j].cooldown == 0)
                entities[j].bounce(entities[i]);
            }
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
      text(`Final size: ${int(player.diameter)}`, width / 2, height / 2 + 24);
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