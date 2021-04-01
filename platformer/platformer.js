//pick your prof title screen
//avoid blackboard icons, github icons
//points for gvsu logos

// https://www.deviantart.com/turboignited/art/Stickman-Spritesheet-691692371
// https://opengameart.org/content/man-walking-animation
// https://opengameart.org/content/animated-character
// https://leftshoe18.itch.io/animated-stick-figure-unity

//stickman: https://www.deviantart.com/turboignited/art/Stickman-Spritesheet-691692371

// https://www.kenney.nl/assets/simplified-platformer-pack
// solarize --> brightness:60 --> duplicate/add noise/75% opacity on top

// skull --> https://opengameart.org/content/pixel-skulls
// scofanogd (CC0)

function getRandomInteger(min, max) {
  return Math.floor(random(min, max)) + min;
}

function plusOrMinus() {
  return Math.random() < 0.5 ? -1 : 1;
}

// https://www.howtobuildsoftware.com/index.php/how-do/Krd/normalization-normalize-normalizing-number-between-2-ranges
function normalize(num, fromMin, fromMax, toMin, toMax)
{
  return toMin + (num - fromMin)/(fromMax - fromMin) * (toMax - toMin)
}


//based on https://workshops.hackclub.com/platformer/
var uiSprites
var groundSprites
var GROUND_SPRITE_WIDTH = 64//50
var GROUND_SPRITE_HEIGHT = 64//50
var UI_HEIGHT = 64
var numGroundSprites
var obstacleSprites
var coinSprites
var houseSprites
var powerupSprites
var uiBossSprites

var coinImg
var groundImg
var powerupImg
var foliageImg
var obstacleImg
var numHouseImages
var houseImg
var houseImages
var uiBossImg

var bossFrameCount = 2500
var GRAVITY = 0.3
var JUMP = -5

var PLAYER_INDEX = 10
var BULLET_INDEX = 9
var COIN_INDEX = 8
var BUSH_INDEX = 7
var HOUSE_INDEX = 6
var GROUND_INDEX = 5

var player
var miniPlayer
var updateMiniPlayer = true
var isGameOver
var isPaused
var powerupTimer
var score
var bossUI

var lastKeyPressTimer
var lastKeyPressDelay = 10 // don't auto-trigger pause on fresh start

var scenes = []
var locFrameCount

// enemy 
var currentEnemy

let systems


//// particle stuff
////

function collideEntity(e, p) {
  if (powerupTimer > 0) {
    score += 200
    e.remove()
  } else {
    isGameOver = true
    lastKeyPressTimer = lastKeyPressDelay * 4
  }
}

function addCoin(c, p) {
  let _p = new ParticleSystem(createVector(c.position.x, c.position.y));
  systems.push(_p);

  score += 100
  c.remove()
}

function addPowerup(c, p) {
  powerupTimer = 100
  player.changeAnimation('powerup')
  c.remove()
}

function setup() {
  isGameOver        = false
  isPaused          = false
  locFrameCount     = 0
  powerupTimer      = 0
  lastKeyPressTimer = 0
  score             = 0
  currentEnemy      = 0  // change me to an enum
  systems           = []

  let kenneyPath = "../assets/kenney/PNG/"

  houseImages = [loadImage("../assets/kenney/background-elements-redux-fix/PNG/Default/house1.png"),
  loadImage("../assets/kenney/background-elements-redux-fix/PNG/Default/house2.png"),
  loadImage("../assets/kenney/background-elements-redux-fix/PNG/Default/houseAlt1.png"),
  loadImage("../assets/kenney/background-elements-redux-fix/PNG/Default/houseAlt2.png"),
  loadImage("../assets/kenney/background-elements-redux-fix/PNG/Default/houseSmall1.png"),
  loadImage("../assets/kenney/background-elements-redux-fix/PNG/Default/houseSmall2.png"),
  loadImage("../assets/kenney/background-elements-redux-fix/PNG/Default/houseSmallAlt1.png"),
  loadImage("../assets/kenney/background-elements-redux-fix/PNG/Default/houseSmallAlt2.png")];
  numHouseImages = houseImages.length;

  coinImg     = loadImage("../assets/gvsu-logo-1.png")
  powerupImg  = loadImage(kenneyPath + "Tiles/platformPack_tile023.png")
  groundImg   = loadImage(kenneyPath + "Tiles/platformPack_tile001.png")
  bossGndImg  = loadImage(kenneyPath + "Tiles/platformPack_tile013.png")
  foliageImg  = loadImage(kenneyPath + "Tiles/platformPack_tile045.png")
  obstacleImg = loadImage(kenneyPath + "Tiles/platformPack_tile024-small.png")
  spikeImg    = loadImage(kenneyPath + "Tiles/platformPack_tile043.png")

  createCanvas(800, 600)//400, 300)
  background(150, 200, 250)

  groundSprites    = new Group()
  //spikeSprites     = new Group()
  obstacleSprites  = new Group()
  coinSprites      = new Group()
  powerupSprites   = new Group()
  uiSprites        = new Group()
  foliageSprites   = new Group()
  houseSprites     = new Group()
  numGroundSprites = width / GROUND_SPRITE_WIDTH + 1


  /*
  // -2 because it helps with the offset
  for (let n = -2; n < numGroundSprites; n++) {
    let gs = createSprite(
      n * 64,//50,
      height - 25,
      GROUND_SPRITE_WIDTH,
      GROUND_SPRITE_HEIGHT
    )
    gs.addImage(groundImg)
    gs.depth = GROUND_INDEX
    groundSprites.add(gs)
  }*/

  /// Player sprites
  //player = createSprite(100, height-75, 25, 25)//50, 50)
  player = createSprite(100, height - 75, 96, 96)//128, 128)//25, 25)//50, 50)
  playerAnim = player.addAnimation('walking', kenneyPath + "Characters/platformChar_walk1.png", kenneyPath + "Characters/platformChar_walk2.png")//'sprites/walk/1.png', 'sprites/walk/20.png')
  playerAnim.frameDelay = 12
  playerIdleAnim = player.addAnimation("idling", kenneyPath + "Characters/platformChar_idle1.png", kenneyPath + "Characters/platformChar_idle2.png")
  playerIdleAnim.frameDelay = 24

  powerupAnim = player.addAnimation('powerup', kenneyPath + "Characters/platformChar_walk1-power.png", kenneyPath + "Characters/platformChar_walk2-power.png")//'sprites/walk/1.png', 'sprites/walk/20.png')
  powerupAnim.frameDelay = 12

  player.changeAnimation('walking')
  player.setCollider('rectangle', 1, 15, 78, 68)//8, 24, 78, 64)

  /// UI sprites
  ui            = createSprite(0, 0, width, UI_HEIGHT)
  ui.shapeColor = color(0, 86, 152)
  ui.depth      = GROUND_INDEX
  uiSprites.add(ui)

  // Mini player sprites
  miniPlayer                = createSprite(0, 12, 96, 96)
  miniPlayer.scale          = 0.333
  miniPlayerAnim            = miniPlayer.addAnimation("idling", kenneyPath + "Characters/platformChar_walk1.png", kenneyPath + "Characters/platformChar_walk2.png")
  miniPlayer.depth          = BULLET_INDEX
  miniPlayerAnim.frameDelay = 24

  // Boss head sprites 
  bossUI                = createSprite(width/2, 16, 32, 32)
  bossUIAnim            = bossUI.addAnimation("snapping", "sprites/skull1.png", "sprites/skull2.png")
  bossUI.depth          = BULLET_INDEX
  bossUIAnim.frameDelay = 24

  resetGame()

  // setup scenes
  // main menu
  // discussion
  // gameplay?
}

function resetGame() {
  //spikeSprites.removeSprite()
  groundSprites.removeSprites()
  for (let n = -2; n < numGroundSprites; n++) {
    let gs = createSprite(
      n * 64,//50,
      height - 25,
      GROUND_SPRITE_WIDTH,
      GROUND_SPRITE_HEIGHT
    )
    gs.depth = GROUND_INDEX
    gs.addImage(groundImg)
    groundSprites.add(gs)
  }

  player.position.x = 100
  //player.position.y = height - 50 - player.height / 2
  player.position.y = height - 64 - player.height / 2
  player.velocity.y = 0


  coinSprites.removeSprites()
  obstacleSprites.removeSprites()
  powerupSprites.removeSprites()
  foliageSprites.removeSprites()
  houseSprites.removeSprites()

  systems = []

  isPaused      = false
  isGameOver    = false
  locFrameCount = 0
  score         = 0
  lastKeyPressTimer = lastKeyPressDelay

  miniPlayer.position.x = camera.position.x - width/2 + 16
  bossUI.position.x     = camera.position.x
  updateMiniPlayer      = true
}

function mouseClicked() {
  if (isGameOver)
    resetGame()
  else {
    player.velocity.y = JUMP
  }
}

function draw() {
  if (lastKeyPressTimer > 0)
    lastKeyPressTimer--

  if (isGameOver) {
    background(0)
    fill(255)
    textAlign(CENTER)
    text('Final score: ' + score, camera.position.x, camera.position.y - 20)
    text('Game over! Click or press any key to restart', camera.position.x, camera.position.y)

    if ((keyIsPressed === true) && (lastKeyPressTimer == 0)) {
      resetGame()
    }

  } else {
    background(150, 200, 250)

    if (!isPaused) {
      player.velocity.y = player.velocity.y + GRAVITY

      ///////////////COLLISIONS
      // collide with ground
      if (groundSprites.overlap(player)) {
        player.velocity.y = 0
        player.position.y = height - 55 - player.height / 2
        //player.position.y = height - 50 - player.height / 2
      }

      //if (spikeSprites.overlap(player)) {
       // isGameOver = true;
//      }

      // collide with UI
      if (uiSprites.overlap(player)) {
        player.position.y = height - 64 - player.height / 2
        //player.position.y = height - 50 - player.height / 2
      }

      ///////////////USER INPUT
      // handle input
      if (keyDown(UP_ARROW)) {
        player.velocity.y = JUMP
        //console.log('wtf')
      }

      // DEBUG
      if (keyDown('a')) {
        powerupTimer = 200
        player.changeAnimation('powerup')
      }


      ///////////////SPRITES
      // ground drawing
      var firstGroundSprite = groundSprites[0]
      if (firstGroundSprite.position.x <= camera.position.x - (width / 2 + firstGroundSprite.width / 2)) {
        groundSprites.remove(firstGroundSprite)
        firstGroundSprite.position.x = firstGroundSprite.position.x + numGroundSprites * firstGroundSprite.width
        firstGroundSprite.depth = GROUND_INDEX

        if (locFrameCount >= bossFrameCount) // boss ground
          firstGroundSprite.addImage(bossGndImg)
        groundSprites.add(firstGroundSprite)
      }

//      var firstSpikeSprite = spikeSprites[0];

      // spawn random foliage
      if (random() > 0.98) {
        var fol = createSprite(camera.position.x + width, height - 82, 64, 64)
        fol.addImage(foliageImg)
        fol.depth = BUSH_INDEX
        fol.life = 1000
        foliageSprites.add(fol)
      }
      var firstFoliage = foliageSprites[0]
      if ((foliageSprites.length > 0) && (firstFoliage.position.x <= camera.position.x - (width / 2 + firstFoliage.width / 2))) {
        removeSprite(firstFoliage)
      }

      // spawn random houses
      /*
      if ((random() > 0.98) && (houseImages.length > 0)) {
        var house = createSprite(camera.position.x + width, height-82, 64, 64)
        house.addImage(houseImages[getRandomInteger(0,numHouseImages)]);
        house.depth = HOUSE_INDEX
        house.life  = 1000
        houseSprites.add(house)
      }
      var firstHouse = houseSprites[0]
      if ((houseSprites.length > 0) && (firstHouse.position.x <= camera.position.x - (width/2 + firstHouse.width / 2))) {
        removeSprite(firstHouse)
      }
      */

      // UI
      //miniPlayer.position.x = camera.position.x - width/2 + 16

      if (miniPlayer.position.x >= (bossUI.position.x - 16))
        updateMiniPlayer = false

      if (updateMiniPlayer) {
        miniPlayer.position.x = (camera.position.x - width/2 + 32) + (-1 * 32/2) + (width * locFrameCount)/(bossFrameCount*2)
      } else {
        miniPlayer.position.x = bossUI.position.x - 16
      }
      ui.position.x         = camera.position.x
      bossUI.position.x     = camera.position.x

      if (locFrameCount > bossFrameCount*2) {
        isGameOver = true
      }



      // calculate new X of miniplayer
//function normalize(num, fromMin, fromMax, toMin, toMax)

/*
      if (miniPlayer.position.x <= (camera.position.x-16)) {
        miniPlayer.position.x = (camera.position.x - width/2 + 16) + (locFrameCount/2)
      } else {
        miniPlayer.position.x = camera.position.x - 15
      }
      */

      // UI - player's distance to boss
      /// draw mini player (calculate distance to boss based on expected frameCount)
      /// draw boss head (set in middle)


      // update player
      player.position.x = player.position.x + 5
      camera.position.x = player.position.x + width / 4

      // shooting patterns
      if (currentEnemy == 0) { // level 1
        if (locFrameCount < bossFrameCount) { // normal things to avoid
          if (((locFrameCount % 20) == 0) && (obstacleSprites.length < 6)) {
            var obstacle = createSprite(camera.position.x + width,
              random(UI_HEIGHT+4, height/2),//height - 64 - 15),
              30, 30)
            obstacle.addImage(obstacleImg)
            obstacle.depth = BULLET_INDEX
            obstacle.pattern = "sine"
            obstacle.rotationSpeed = getRandomInteger(10,30)
            obstacleSprites.add(obstacle)
          }

          // spawn
          /*
          if (((frameCount % 10) == 0) && (obstacleSprites.length < 6)) {
            var obstacle = createSprite(camera.position.x + width,
              random(0, height - 50 - 15),
              30, 30)
            obstacle.addImage(obstacleImg)
            obstacle.depth = BULLET_INDEX
            obstacle.rotationSpeed = getRandomInteger(10,30)
            obstacleSprites.add(obstacle)
          }
          */
          // remove if necessary
          var firstObstacle = obstacleSprites[0]
          if ((obstacleSprites.length > 0) && (firstObstacle.position.x <= camera.position.x - (width / 2 + firstObstacle.width / 2))) {
            removeSprite(firstObstacle)
          }

          // random rotation and bobble
          /*
          let beta = 90 + Math.PI / 2.0
          for (let i = 0; i < obstacleSprites.length; i++) {
            // https://gamedev.stackexchange.com/questions/69694/how-to-make-bullets-follow-a-rotating-sinewave-pattern
            c_dist = 50 * Math.sin(locFrameCount * 0.15)
            obstacleSprites[i].position.y = obstacleSprites[i].position.y + Math.sin(beta) * c_dist
            //c_d = 100 * Math.sin(locFrameCount * 0.25)
            //obstacleSprites[i].position.y = c_d + sin(Math.PI / 2.0) //* locFrameCount
 //           obstacleSprites[i].position.x = Math.sin(locFrameCount)
//            obstacleSprites[i].rotation += 1
            //if (random() > 0.75) {
              //let dir = plusOrMinus()
              //obstacleSprites[i].position.y += dir * 1
              //obstacleSprites[i].rotationSpeed *= dir
            //}
          }
          */


        } else { // boss time!
          textAlign(CENTER)
          fill(0)
          text("BOSS TIME", camera.position.x, 100)
        }
      }

      // end of stage
      /*
      if (locFrameCount > 1000) {
        console.log("WINNER")
        resetGame()
      }
      */




      /*

      // spawn obstacles randomly
      if (random() > 0.95) {
        var obstacle = createSprite(camera.position.x + width,
          random(0, height - 50 - 15),
          30, 30)
        obstacleSprites.add(obstacle)
      }

      // remove if necessary
      var firstObstacle = obstacleSprites[0]
      if ((obstacleSprites.length > 0) && (firstObstacle.position.x <= camera.position.x - (width / 2 + firstObstacle.width / 2))) {
        removeSprite(firstObstacle)
      }



      //// coins
      if (random() > 0.95) {
        var coin = createSprite(camera.position.x + width,
          random(0, height - 50 - 15),
          30, 30)
        coin.addImage(coinImg)
        coinSprites.add(coin)
      }
      // remove if necessary
      var firstCoin = coinSprites[0]
      if ((coinSprites.length > 0) && (firstCoin.position.x <= camera.position.x - (width / 2 + firstCoin.width / 2))) {
        removeSprite(firstCoin)
      }
      // collide
      coinSprites.overlap(player, addCoin)


      //// powerups
      if (random() > 0.99) {
        var powerup = createSprite(camera.position.x + width,
          random(0, height - 50 - 15),
          30, 30)
        powerup.addImage(powerupImg)
        powerup.scale = 0.75
        powerupSprites.add(powerup)

      }
      // remove if necessary
      var firstPowerup = powerupSprites[0]
      if ((powerupSprites.length > 0) && (firstPowerup.position.x <= camera.position.x - (width / 2 + firstPowerup.width / 2))) {
        removeSprite(firstPowerup)
      }
      // collide
      powerupSprites.overlap(player, addPowerup)

      for (i = 0; i < systems.length; i++) {
        systems[i].run();
        systems[i].addParticle();

        if (systems[i].particles.length > 10) {
          systems.splice(i, 1);
        }
      }
      */

      // collide
      obstacleSprites.overlap(player, collideEntity)

      drawSprites()

      // score
      //score = score + 1
      //textAlign(CENTER)
      //text(score, camera.position.x, 10)

      /////////////////METRIC UPDATES

      locFrameCount += 1

      // powerup
      if (powerupTimer > 0) {
        powerupTimer--
        if (powerupTimer == 0)
          player.changeAnimation('walking')
      }
    } else { // paused
      drawSprites()

      fill('rgba(0,255,0,0.1)')
      rect(camera.position.x - (width / 2), 0, width, height)

      //  console.log("paused")
    }
  }
}

function keyReleased() {
  if ((keyCode == 80) && (!isGameOver) && (lastKeyPressTimer == 0)) { // pause
    isPaused = !isPaused
    lastKeyPressTimer = lastKeyPressDelay
    if (isPaused) {
      player.changeAnimation("idling")
      ui.position.x += 4
    } else
      player.changeAnimation("walking")
  }
}


// A simple Particle class
let Particle = function (position) {
  this.acceleration = createVector(0, 0.05);
  this.velocity = createVector(random(-1, 1), random(-1, 0));
  this.position = position.copy();
  this.lifespan = 255.0;
};

Particle.prototype.run = function () {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function () {
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function () {
  stroke(200, this.lifespan);
  strokeWeight(2);
  fill(127, this.lifespan);
  ellipse(this.position.x, this.position.y, 12, 12);
};

// Is the particle still useful?
Particle.prototype.isDead = function () {
  if (this.lifespan < 0) {
    return true;
  } else {
    return false;
  }
};

let ParticleSystem = function (position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function () {
  // Add either a Particle or CrazyParticle to the system
  if (int(random(0, 2)) == 0) {
    p = new Particle(this.origin);
  }
  else {
    p = new CrazyParticle(this.origin);
  }
  this.particles.push(p);
};

ParticleSystem.prototype.run = function () {
  for (let i = this.particles.length - 1; i >= 0; i--) {
    let p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};

// A subclass of Particle

function CrazyParticle(origin) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  Particle.call(this, origin);

  // Initialize our added properties
  this.theta = 0.0;
};

// Create a Crazy.prototype object that inherits from Particle.prototype.
// Note: A common error here is to use "new Particle()" to create the
// Crazy.prototype. That's incorrect for several reasons, not least
// that we don't have anything to give Particle for the "origin"
// argument. The correct place to call Particle is above, where we call
// it from Crazy.
CrazyParticle.prototype = Object.create(Particle.prototype); // See note below

// Set the "constructor" property to refer to CrazyParticle
CrazyParticle.prototype.constructor = CrazyParticle;

// Notice we don't have the method run() here; it is inherited from Particle

// This update() method overrides the parent class update() method
CrazyParticle.prototype.update = function () {
  Particle.prototype.update.call(this);
  // Increment rotation based on horizontal velocity
  this.theta += (this.velocity.x * this.velocity.mag()) / 10.0;
}

// This display() method overrides the parent class display() method
CrazyParticle.prototype.display = function () {
  // Render the ellipse just like in a regular particle
  Particle.prototype.display.call(this);
  // Then add a rotating line
  push();
  translate(this.position.x, this.position.y);
  rotate(this.theta);
  stroke(255, this.lifespan);
  //line(0, 0, 25, 0);
  pop();
}