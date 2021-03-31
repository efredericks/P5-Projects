// Simplex noise library:
// Tracery: http://tracery.io/
// Kenney 1-bit asset pack: https://www.kenney.nl/assets/bit-pack

/// globals
var TILE_WIDTH;
var TILE_HEIGHT;
var NUM_SPRITE_ROWS;
var NUM_SPRITE_COLS;

var MAP_WIDTH;
var MAP_HEIGHT;
var MAP_COLS;
var MAP_ROWS;

var CANVAS_WIDTH;
var CANVAS_HEIGHT;
var CANVAS_COLS;
var CANVAS_ROWS;

var NUM_CHUNKS;
var chunkIndex;

/// sprites
var spriteSheet;
var envSprites;
var npcSprites;
var player;

var playerImg;
var npcImg;

/// depths
var CHARACTER_INDEX;
var NPC_INDEX;
var ENV_INDEX;

/// ui
var activeNPCString
var activeNPCStringTimer
var activeNPCStringTime

/// tracery
var grammar;

/// map
var gameMap;
const TILES = {
  WALL    : 0,
  GROUND  : 1,
  FOLIAGE : 2,
  WATER   : 3,
};
var tileIndices;
var noiseGen;

var recentKeyPress;
var keyPressDelay;

/// helper functions
function getRandomInteger(min, max) {
  return Math.floor(random(min, max)) + min;
}

// get frame index into spritesheet for raw drawing
function getFrameIndex(row, col) {
  return row * NUM_SPRITE_COLS + col;
}

// convert rows/cols into pixels

// shift chunk
function shiftScreen(dir) {
  if (dir == 'left') {
    chunkIndex--;
    if (chunkIndex < 0) chunkIndex = 0;
  } else if (dir == 'right') {
    chunkIndex++;
    if (chunkIndex >= (NUM_CHUNKS-1))
      chunkIndex = NUM_CHUNKS-1;
  }
}

// collide with an entity
function collideEntity(e, p) {
  if (chunkIndex == e.chunk) {
    activeNPCString      = e.vipTitle + " " + e.name + ", " + e.occupation + " [" + e.mood + "]";
    activeNPCStringTimer = activeNPCStringTime;
    //textSize(24);
    //fill(255);
    //text(e.name + ": how's it goin?", e.position.x + 10, e.position.y - 10);
    //console.log(npc.name + '\n' + npc.mood + '\n' + npc.vipTitle + '\n' + npc.occupation);
  }
}

function drawUI() {
  let ui_x = camera.position.x - CANVAS_WIDTH/2;
  let ui_y = camera.position.y - CANVAS_HEIGHT/2;
  fill(color(0,0,0,127));
  rect(ui_x, ui_y, CANVAS_WIDTH, 30);

  if (activeNPCString != "") {
    fill(255);
    textSize(24);
    text(activeNPCString, ui_x + 5, ui_y + 24);
  }
  //text("erik", ui_x + 5, ui_y + 24);
}

function setup() {
  // set globals per https://github.com/processing/p5.js/wiki/p5.js-overview#why-cant-i-assign-variables-using-p5-functions-and-variables-before-setup
  TILE_WIDTH      = 16;
  TILE_HEIGHT     = 16;
  NUM_SPRITE_ROWS = 22;
  NUM_SPRITE_COLS = 48;

  MAP_WIDTH       = 2048;//1024;
  MAP_HEIGHT      = 2048;//1024;
  MAP_COLS        = (int)(MAP_WIDTH  / TILE_WIDTH);
  MAP_ROWS        = (int)(MAP_HEIGHT / TILE_HEIGHT);

  CANVAS_WIDTH    = 800;
  CANVAS_HEIGHT   = 608;
  CANVAS_COLS     = (int)(CANVAS_WIDTH  / TILE_WIDTH);
  CANVAS_ROWS     = (int)(CANVAS_HEIGHT / TILE_HEIGHT);

  NUM_CHUNKS      = 100;
  chunkIndex      = 1; // start in middle

  CHARACTER_INDEX = 99
  NPC_INDEX       = 98
  ENV_INDEX       = 0

  // procgen stuff
  noiseGen        = new FastSimplexNoise({frequency: 0.01, octaves: 4});
  grammar         = tracery.createGrammar(grammars["npcs"]);

  tileIndices = {
    0 : getFrameIndex(17,1), // wall
    1 : getFrameIndex(0,1),  // ground
    2 : getFrameIndex(0,6),  // foliage
    3 : getFrameIndex(5,8),  // water
  };

  // handle key repeating
  recentKeyPress = 0;
  keyPressDelay  = 5;

  activeNPCString      = "";
  activeNPCStringTimer = 0;
  activeNPCStringTime  = 200; // delay to show on ui

  /// canvas setup
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  background(71, 45, 60);

  // setup sprites
  let kenneyPath = "assets/1bitpack_kenney_1.1/Tilesheet/colored_packed.png";
  spriteSheet = loadSpriteSheet(kenneyPath, 16, 16, 1056);

  envSprites = new Group();
  npcSprites = new Group();

  // player [col:35, row: 14]
  playerImg    = loadImage("assets/separate/player.png");
  player       = createSprite((TILE_WIDTH*2)+(TILE_WIDTH/2),(TILE_HEIGHT*2)+(TILE_HEIGHT/2), TILE_WIDTH, TILE_HEIGHT);
  player.depth = CHARACTER_INDEX;
  player.addImage(playerImg);

  // npc
  npcImg       = loadImage("assets/separate/npc.png");
  npc          = createSprite((TILE_WIDTH*4)+(TILE_WIDTH/2),(TILE_HEIGHT*4)+(TILE_HEIGHT/2), TILE_WIDTH, TILE_HEIGHT);
  /// generative:
  npc.name     = grammar.flatten("#name#");
  npc.mood     = grammar.flatten("#mood#");
  npc.vipTitle = grammar.flatten("#vipTitle#");
  npc.occupation = grammar.flatten("#occupation#");
  ///
  npc.depth    = NPC_INDEX;
  //npc.addImage = npcImg;
  npc.chunk    = 1;
  npc.speed    = 2;
  npc.draw     = function() {
    if (chunkIndex == this.chunk)
      image(npcImg, this.deltaX*2, this.deltaY*2);
  }
  npc.update   = function() {
    if (chunkIndex == this.chunk) { // only update on current chunk
      // https://stackoverflow.com/questions/20044791/how-to-make-an-enemy-follow-the-player-in-pygame
      if (random() > 0.9) { // move towards player
        // direction vector
        let dx   = player.position.x - this.position.x;
        let dy   = player.position.y - this.position.y;
        let dist = Math.hypot(dx, dy);

        // normalize
        dx /= dist;
        dy /= dist;

        if (!(dist == 16)) {
          if (random() > 0.5) { // move x
            if (dx > 0)
              this.position.x += TILE_WIDTH;
            else if (dx < 0)
              this.position.x -= TILE_WIDTH;
          } else { // move y
            if (dy > 0)
              this.position.y += TILE_HEIGHT;
            else if (dy < 0)
              this.position.y -= TILE_HEIGHT;
          }
        }

        //this.position.x += dx * this.speed;
        //this.position.y += dy * this.speed;
      }
    }
  }
  npcSprites.add(npc);

  // environment
  gameMap = new Array(NUM_CHUNKS);
  for (let _chunk = 0; _chunk < NUM_CHUNKS; _chunk++) {
    gameMap[_chunk] = [];
    let randomOffset = getRandomInteger(0,10000);
    for (let _r = 0; _r < MAP_ROWS; _r++) {
      gameMap[_chunk][_r] = [];
      for (let _c = 0; _c < MAP_COLS; _c++) {
        if (((_c == 0) || (_c == (MAP_COLS-1))) ||
            ((_r == 0) || (_r == (MAP_ROWS-1))))
          gameMap[_chunk][_r].push(TILES.WALL);
        else {
          let _noise = noiseGen.get2DNoise(_c+randomOffset, _r+randomOffset);
          if (_noise < 0)
            gameMap[_chunk][_r].push(TILES.GROUND);
          else if (_noise < 0.2)
            gameMap[_chunk][_r].push(TILES.WATER);
          else if (_noise < 0.4)
            gameMap[_chunk][_r].push(TILES.FOLIAGE);
          else
            gameMap[_chunk][_r].push(TILES.GROUND);

          //if (random() > 0.9)
            //gameMap[_r].push(TILES.FOLIAGE);
          //else
            //gameMap[_r].push(TILES.GROUND); // replace with simplex
        }
      }
    }
  }
  // npcs

  frameRate(20);
}

function keyReleased() {
  if (key == "a")
    shiftScreen("left");
  else if (key == "d")
    shiftScreen("right");
}

function draw() {


  /// draw functions
  background(71, 45, 60);

  for (let _r = 0; _r < MAP_ROWS; _r++) {
    for (let _c = 0; _c < MAP_COLS; _c++) {
      let _index;
//      if (gameMap[_r][_c] == TILES.WALL)
      spriteSheet.drawFrame(tileIndices[gameMap[chunkIndex][_r][_c]], _c * TILE_WIDTH, _r * TILE_HEIGHT);
 //     else if (gameMap[_r][_c] == TILES.FOLIAGE)
  //      spriteSheet.drawFrame(getFrameIndex(0,6), _c * TILE_WIDTH, _r * TILE_HEIGHT);
    }
  }

  // interact
  npcSprites.collide(player, collideEntity)

  // update entities
  npcSprites.forEach(elem => elem.update());



  // set camera and draw player 
  camera.position = player.position;
  //if (camera.position.x <= CANVAS_WIDTH/2)
   // camera.position.x = CANVAS_WIDTH/2;

//  spriteSheet.drawFrame(getFrameIndex(14, 35), player.position.x, player.position.y);
  drawSprites();

  drawUI();

  /// handle updates
  if (activeNPCStringTimer > 0) {
    activeNPCStringTimer--;
    if (activeNPCStringTimer <= 0) {
      activeNPCString      = "";
      activeNPCStringTimer = 0;
    }
  }


//  if (recentKeyPress == 0) {
    if (keyDown(UP_ARROW))
      player.position.y -= TILE_HEIGHT;
    if (keyDown(DOWN_ARROW))
      player.position.y += TILE_HEIGHT;
    if (keyDown(LEFT_ARROW))
      player.position.x -= TILE_WIDTH;
    if (keyDown(RIGHT_ARROW))
      player.position.x += TILE_WIDTH;


      /*
    recentKeyPress = keyPressDelay;
  } else { // debounce a bit
    recentKeyPress--;
    if (recentKeyPress <= 0)
      recentKeyPress = 0;
  }*/


  // bounds
  if ((player.position.x - (TILE_WIDTH/2)) <= TILE_WIDTH)
    player.position.x = TILE_WIDTH + (TILE_WIDTH/2);
  else if ((player.position.x - (TILE_WIDTH/2)) >= MAP_WIDTH-(TILE_WIDTH*2))
    player.position.x = MAP_WIDTH - (TILE_WIDTH*2) + (TILE_WIDTH/2);

  if ((player.position.y - (TILE_HEIGHT/2)) <= TILE_HEIGHT)
    player.position.y = TILE_HEIGHT + (TILE_HEIGHT/2);
  else if ((player.position.y - (TILE_HEIGHT/2)) >= MAP_HEIGHT-(TILE_HEIGHT*2))
    player.position.y = MAP_HEIGHT - (TILE_HEIGHT*2) + (TILE_HEIGHT/2);

  //camera.position.x = player.position.x + CANVAS_WIDTH / 4;
  //camera.position.y = player.position.y + CANVAS_HEIGHT / 4;

  // debug
  /*
  textSize(16);
  fill(255)
  text('camera [' + camera.position.x + '] [' + camera.position.y + ']', player.position.x, player.position.y - 24)
  text('chunk [' + chunkIndex + ']', player.position.x, player.position.y - 12)
  */
}