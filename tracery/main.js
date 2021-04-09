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
var subChunkIndex;
var currentLevelActive; // 0-overworld, 1-subworld

/// sprites
var spriteSheet;
var envSprites;
var npcSprites;
var pickupSprites;
var player;
var numGenericNPCs;

var playerImg;
var npcImg;

var blueCrabImg;
var blueCrab;

var TREE_SPRITE_START;
var TREE_SPRITE_END;

/// sprite depths
var CHARACTER_INDEX;
var NPC_INDEX;
var ENV_INDEX;

/// ui
var paused;
var activeTile;
var activeNPCStringTime;
var activeNPCStringTimer;
var activeNPCStringTime;

/// tracery
var npc_grammar;
var env_grammar;

/// map
var subMap;
var gameMap;
const TILES = {
  WALL: 0,
  GROUND: 1,
  FOLIAGE: 2,
  WATER: 3,
  TREE: 4, //4-11 is trees
  BEACH: 12,
  BRICK: 13,
};
//var tileIndices;
var tilePositions;
var noiseGen;

var recentKeyPress;
var keyPressDelay;

/// helper functions
function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// get frame index into spritesheet for raw drawing
function getFrameIndex(row, col) {
  return row * NUM_SPRITE_COLS + col;
}

function getSpriteOffset(row, col) {
  let dx = col * TILE_WIDTH;
  let dy = row * TILE_HEIGHT;
  return { 'dx': dx, 'dy': dy };
}

// get indices from xy coords -- shouldn't need to offset since the position x/y is the world
// and our camera coords are separate
function getRowCol(x, y) {
  let dc = (int)((x - (TILE_WIDTH / 2)) / TILE_WIDTH);
  let dr = (int)((y - (TILE_HEIGHT / 2)) / TILE_HEIGHT);
  return { 'row': dr, 'col': dc };
}

// convert rows/cols into pixels

// shift chunk
function shiftScreen(dir) {
  if (dir == 'left') {
    chunkIndex--;
    if (chunkIndex < 0) chunkIndex = 0;
  } else if (dir == 'right') {
    chunkIndex++;
    if (chunkIndex >= (NUM_CHUNKS - 1))
      chunkIndex = NUM_CHUNKS - 1;
  }
  activeNPCString = "Chunk: " + chunkIndex;
  activeNPCStringTimer = activeNPCStringTime;
}

// collide with a pickup object
function collidePickup(e, p) {
  // only pickup is the blue crab
  if (chunkIndex == e.chunk) {
    pickupSprites.remove(e);
    e.remove();

    console.log(npcSprites);
    for (let _i = 0; _i < npcSprites.length; _i++) {
      if (npcSprites[_i].questGiver)
        npcSprites[_i].quest["done"] = true;
    }
  }
}


// collide with an NPC
function collideNPC(e, p) {
  if (chunkIndex == e.chunk) {
    activeNPCString = e.vipTitle + " " + e.name + ", " + e.occupation + " [" + e.mood + "]";
    activeNPCStringTimer = activeNPCStringTime;

    if (e.questGiver) { // display message 
      if (e.quest["done"])
        activeNPCString += " : " + e.quest["thanks"];
      else
        activeNPCString += " : " + e.quest["quest"];
    }
    //textSize(24);
    //fill(255);
    //text(e.name + ": how's it goin?", e.position.x + 10, e.position.y - 10);
    //console.log(npc.name + '\n' + npc.mood + '\n' + npc.vipTitle + '\n' + npc.occupation);
  }
}

function drawUI() {
  let ui_x = camera.position.x - CANVAS_WIDTH / 2;
  let ui_y = camera.position.y - CANVAS_HEIGHT / 2;
  fill(color(0, 0, 0, 127));
  rect(ui_x, ui_y, CANVAS_WIDTH, 30);

  if (activeNPCString != "") {
    fill(255);
    textSize(24);
    text(activeNPCString, ui_x + 5, ui_y + 24);
  }
  //text("erik", ui_x + 5, ui_y + 24);
}

// load all image assets first!
function preload() {
  // procgen stuff
  noiseGen    = new FastSimplexNoise({ frequency: 0.01, octaves: 4 });
  npc_grammar = tracery.createGrammar(grammars["npcs"]);
  env_grammar = tracery.createGrammar(grammars["environments"]);

  //used for p5play spritesheet - not working!
  /*
  tileIndices = {
    0 : getFrameIndex(17,1), // wall
    1 : getFrameIndex(0,1),  // ground
    2 : getFrameIndex(0,6),  // foliage
    3 : getFrameIndex(5,8),  // water
  };*/

  //used for p5 image offsetting
  tilePositions = {
    0: { 'row': 17, 'col': 1 }, // wall
    1: { 'row': 0, 'col': 1 }, // ground
    2: { 'row': 0, 'col': 6 }, // foliage
    3: { 'row': 5, 'col': 8 }, // water
    /// trees
    4: { 'row': 1, 'col': 0 },
    5: { 'row': 1, 'col': 1 },
    6: { 'row': 1, 'col': 2 },
    7: { 'row': 1, 'col': 3 },
    8: { 'row': 1, 'col': 4 },
    9: { 'row': 1, 'col': 5 },
    10: { 'row': 2, 'col': 3 },
    11: { 'row': 2, 'col': 4 },
    ///
    12: { 'row': 6, 'col': 47 }, // beach
    13: { 'row': 15, 'col': 7 }, //brick
  };
  TREE_SPRITE_START = 4;
  TREE_SPRITE_END = 11;


  // setup sprites
  pickupSprites = new Group();
  envSprites = new Group();
  npcSprites = new Group();

  let kenneyPath = "assets/1bitpack_kenney_1.1/Tilesheet/colored_packed.png";
  //spriteSheet    = loadSpriteSheet(kenneyPath, 16, 16, 1056);
  spriteSheet = loadImage(kenneyPath);
  playerImg = loadImage("assets/separate/player.png");
  npcImg = loadImage("assets/separate/npc.png");

  blueCrab = createSprite(100, 100, TILE_WIDTH, TILE_HEIGHT);
  let blueCrabAnim = blueCrab.addAnimation("jaunting", "assets/separate/bcrab1.png", "assets/separate/bcrab2.png");
  blueCrabAnim.frameDelay = 12;
  blueCrab.chunk = 1;
  pickupSprites.add(blueCrab);

  //18,7 (blue crab?)
  //20,7
}

function setup() {
  // set globals per https://github.com/processing/p5.js/wiki/p5.js-overview#why-cant-i-assign-variables-using-p5-functions-and-variables-before-setup
  TILE_WIDTH = 16;
  TILE_HEIGHT = 16;
  NUM_SPRITE_ROWS = 22;
  NUM_SPRITE_COLS = 48;

  MAP_WIDTH = 2048;//1024;
  MAP_HEIGHT = 2048;//1024;
  MAP_COLS = (int)(MAP_WIDTH / TILE_WIDTH);
  MAP_ROWS = (int)(MAP_HEIGHT / TILE_HEIGHT);

  CANVAS_WIDTH = 800;
  CANVAS_HEIGHT = 608;
  CANVAS_COLS = (int)(CANVAS_WIDTH / TILE_WIDTH);
  CANVAS_ROWS = (int)(CANVAS_HEIGHT / TILE_HEIGHT);

  NUM_CHUNKS = 4;//100;
  chunkIndex = 1; // start in middle
  currentLevelActive = 0; // overworld active
  subChunkIndex = 0;

  CHARACTER_INDEX = 99
  NPC_INDEX = 98
  ENV_INDEX = 0

  // handle key repeating
  recentKeyPress = 0;
  keyPressDelay = 5;

  paused = false; // game pause

  activeTile = null; // display tile info

  activeNPCString = "";
  activeNPCStringTimer = 0;
  activeNPCStringTime = 200; // delay to show on ui

  numGenericNPCs = 10; // number of NPCs to generate randomly in the overworld (flavor NPCs)

  /// canvas setup
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  background(71, 45, 60);


  // player [col:35, row: 14]
  player = createSprite((TILE_WIDTH * 2) + (TILE_WIDTH / 2), (TILE_HEIGHT * 2) + (TILE_HEIGHT / 2), TILE_WIDTH, TILE_HEIGHT);
  player.depth = CHARACTER_INDEX;
  player.addImage(playerImg);

  // npc
  let questGiver = getRandomInteger(0, numGenericNPCs);
  for (let _n = 0; _n < numGenericNPCs; _n++) {
    npc = createSprite((TILE_WIDTH * 4) + (TILE_WIDTH / 2), (TILE_HEIGHT * 4) + (TILE_HEIGHT / 2), TILE_WIDTH, TILE_HEIGHT);
    /// generative:
    npc.name = npc_grammar.flatten("#name#");
    npc.mood = npc_grammar.flatten("#mood#");
    npc.vipTitle = npc_grammar.flatten("#vipTitle#");
    npc.occupation = npc_grammar.flatten("#occupation#");
    ///
    npc.depth = NPC_INDEX;
    //npc.addImage = npcImg;
    npc.chunk = getRandomInteger(0, NUM_CHUNKS); //1;
    npc.speed = 2; // tbd

    if (_n == questGiver) {
      npc.questGiver = true;
      npc.quest = {
        "quest": "Have you seen my BLUE CRAB?", // make this a list?
        "thanks": "Thanks m8",
        "done": false
      };
    } else
      npc.questGiver = false;

    npc.draw = function () {
      if (chunkIndex == this.chunk) {
        if (this.questGiver)
          rect(this.deltaX * 2, this.deltaY * 2, this.width + 5, this.height + 5);
        image(npcImg, this.deltaX * 2, this.deltaY * 2);
      }
    }
    npc.update = function () {
      if ((chunkIndex == this.chunk) && (!paused)) { // only update on current chunk / not paused
        npcSprites.add(this);
        // https://stackoverflow.com/questions/20044791/how-to-make-an-enemy-follow-the-player-in-pygame
        if (random() > 0.9) { // move towards player
          // direction vector
          let dx = player.position.x - this.position.x;
          let dy = player.position.y - this.position.y;
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
      } else // remove from colliders
        npcSprites.remove(this);
    }
  }

  // environment
  gameMap = new Array(NUM_CHUNKS);
  for (let _chunk = 0; _chunk < NUM_CHUNKS; _chunk++) {
    gameMap[_chunk] = [];
    let randomOffset = getRandomInteger(0, 10000);
    for (let _r = 0; _r < MAP_ROWS; _r++) {
      gameMap[_chunk][_r] = [];
      for (let _c = 0; _c < MAP_COLS; _c++) {

        let _obj = {};

        if (((_c == 0) || (_c == (MAP_COLS - 1))) ||
          ((_r == 0) || (_r == (MAP_ROWS - 1))))
          _obj = {"type": TILES.WALL, "desc": "Impassable wall"};
        else {
          let _noise = noiseGen.get2DNoise(_c + randomOffset, _r + randomOffset);
          if (_noise < 0)
            _obj = {"type": TILES.GROUND, "desc": env_grammar.flatten("#ground#")};
          else if (_noise < 0.1)
            _obj = {"type": TILES.BEACH, "desc": env_grammar.flatten("#beach#")};
          else if (_noise < 0.2)
            _obj = {"type": TILES.WATER, "desc": env_grammar.flatten("#water#")};
          else if (_noise < 0.25)
            _obj = {"type": TILES.BEACH, "desc": env_grammar.flatten("#beach#")};
          else if (_noise < 0.4)
            _obj = {"type": getRandomInteger(TREE_SPRITE_START, TREE_SPRITE_END+1), "desc": env_grammar.flatten("#trees#")};
          else if (_noise < 0.5)
            _obj = {"type": TILES.FOLIAGE, "desc": env_grammar.flatten("#foliage#")};
          else
            _obj = {"type": TILES.GROUND, "desc": env_grammar.flatten("#ground#")};
        }
        gameMap[_chunk][_r].push(_obj);
      }
    }
  }

  // underworld
  subMap = new Array(NUM_CHUNKS);
  for (let _chunk = 0; _chunk < 1; _chunk++) {
    subMap[_chunk] = [];
    let randomOffset = getRandomInteger(0, 10000);
    for (let _r = 0; _r < 10; _r++) {
      subMap[_chunk][_r] = [];
      for (let _c = 0; _c < 10; _c++) {
        if (((_c == 0) || (_c == (10 - 1))) ||
          ((_r == 0) || (_r == (10 - 1))))
          subMap[_chunk][_r].push(TILES.BRICK);
        else {
          subMap[_chunk][_r].push(TILES.GROUND);
        }
      }
    }
  }





  // touch controls
  lbutton = createButton('<');
  lbutton.position(10, 90, 65);
  lbutton.mousePressed(tLeft);

  rbutton = createButton('>');
  rbutton.position(40, 90, 65);
  rbutton.mousePressed(tRight);

  ubutton = createButton('^');
  ubutton.position(25, 80, 65);
  ubutton.mousePressed(tUp);

  dbutton = createButton('v');
  dbutton.position(25, 100, 65);
  dbutton.mousePressed(tDown);

  lcbutton = createButton('chunk <');
  lcbutton.position(10, 120, 65);
  lcbutton.mousePressed(sLeft);

  rcbutton = createButton('chunk >');
  rcbutton.position(10, 140, 65);
  rcbutton.mousePressed(sRight);

  frameRate(20);
}

// abstract this!
function sLeft() {
  shiftScreen("left");
}
function sRight() {
  shiftScreen("right");
}
function tLeft() {
  player.position.x -= TILE_WIDTH;
}
function tRight() {
  player.position.x += TILE_WIDTH;
}
function tUp() {
  player.position.y -= TILE_HEIGHT;
}
function tDown() {
  player.position.y += TILE_HEIGHT;
}

function keyReleased() {
  if (key == "a")
    shiftScreen("left");
  else if (key == "d")
    shiftScreen("right");
  else if (key == "z") {
    if (currentLevelActive == 0)
      currentLevelActive = 1;
    else
      currentLevelActive = 0;
  }
  else if (key == "q") { // query the local space
    paused = !paused;

    if (paused) {
      let _rc = getRowCol(player.position.x, player.position.y);
      activeTile = _rc//gameMap[chunkIndex][_rc['row']][_rc['col']];
    } else
      activeTile = null;
  }
}

function draw() {

  /// draw functions
  background(71, 45, 60);

  if (currentLevelActive == 0) {
    for (let _r = 0; _r < MAP_ROWS; _r++) {
      for (let _c = 0; _c < MAP_COLS; _c++) {
        //https://github.com/processing/p5.js/issues/1567
        //image(img,[sx=0],[sy=0],[sWidth=img.width],[sHeight=img.height],[dx=0],[dy=0],[dWidth],[dHeight])
        let _tile = gameMap[chunkIndex][_r][_c]['type'];
        let offset = getSpriteOffset(tilePositions[_tile]['row'], tilePositions[_tile]['col']);
        image(spriteSheet, _c * TILE_WIDTH, _r * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, offset['dx'], offset['dy'], TILE_WIDTH, TILE_HEIGHT);
      }
    }
  } else {
    for (let _r = 0; _r < 10; _r++) {
      for (let _c = 0; _c < 10; _c++) {
        //https://github.com/processing/p5.js/issues/1567
        //image(img,[sx=0],[sy=0],[sWidth=img.width],[sHeight=img.height],[dx=0],[dy=0],[dWidth],[dHeight])
        let _tile = subMap[0][_r][_c];
        let offset = getSpriteOffset(tilePositions[_tile]['row'], tilePositions[_tile]['col']);
        image(spriteSheet, _c * TILE_WIDTH, _r * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, offset['dx'], offset['dy'], TILE_WIDTH, TILE_HEIGHT);
      }
    }
  }

  if (!paused) {
    // interact
    npcSprites.collide(player, collideNPC);
    pickupSprites.overlap(player, collidePickup);

    // update entities -- not needed?
    //npcSprites.forEach(elem => elem.update());
  }


  // set camera and draw player 
  camera.position = player.position;
  //if (camera.position.x <= CANVAS_WIDTH/2)
  // camera.position.x = CANVAS_WIDTH/2;

  //  spriteSheet.drawFrame(getFrameIndex(14, 35), player.position.x, player.position.y);
  drawSprites();
  drawUI();

  /// handle updates
  if (!paused) {
    if (activeNPCStringTimer > 0) {
      activeNPCStringTimer--;
      if (activeNPCStringTimer <= 0) {
        activeNPCString = "";
        activeNPCStringTimer = 0;
      }
    }


    //  if (recentKeyPress == 0) {
    if (keyDown(UP_ARROW)) {
      player.position.y -= TILE_HEIGHT;
    }
    if (keyDown(DOWN_ARROW)) {
      player.position.y += TILE_HEIGHT;
    }
    if (keyDown(LEFT_ARROW)) {
      player.position.x -= TILE_WIDTH;
    }
    if (keyDown(RIGHT_ARROW)) {
      player.position.x += TILE_WIDTH;
    }

    /*
  recentKeyPress = keyPressDelay;
} else { // debounce a bit
  recentKeyPress--;
  if (recentKeyPress <= 0)
    recentKeyPress = 0;
}*/


    // bounds
    if ((player.position.x - (TILE_WIDTH / 2)) <= TILE_WIDTH)
      player.position.x = TILE_WIDTH + (TILE_WIDTH / 2);
    else if ((player.position.x - (TILE_WIDTH / 2)) >= MAP_WIDTH - (TILE_WIDTH * 2))
      player.position.x = MAP_WIDTH - (TILE_WIDTH * 2) + (TILE_WIDTH / 2);

    if ((player.position.y - (TILE_HEIGHT / 2)) <= TILE_HEIGHT)
      player.position.y = TILE_HEIGHT + (TILE_HEIGHT / 2);
    else if ((player.position.y - (TILE_HEIGHT / 2)) >= MAP_HEIGHT - (TILE_HEIGHT * 2))
      player.position.y = MAP_HEIGHT - (TILE_HEIGHT * 2) + (TILE_HEIGHT / 2);

    //camera.position.x = player.position.x + CANVAS_WIDTH / 4;
    //camera.position.y = player.position.y + CANVAS_HEIGHT / 4;

    // debug
    /*
    textSize(16);
    fill(255)
    text('camera [' + camera.position.x + '] [' + camera.position.y + ']', player.position.x, player.position.y - 24)
    text('chunk [' + chunkIndex + ']', player.position.x, player.position.y - 12)
    */
  } else {
    if (activeTile) { // show some info!
      // bg
      fill(color(0,0,0,220));
      let ui_x  = camera.position.x - CANVAS_WIDTH / 2;
      let ui_y  = camera.position.y - CANVAS_HEIGHT / 2;
      rect(ui_x + 50, ui_y + 50, CANVAS_WIDTH - 100, CANVAS_HEIGHT - 100);

      // info
      fill(255);
      textSize(24);

      let _tile = gameMap[chunkIndex][activeTile['row']][activeTile['col']];
      let msg = _tile.desc;
      text(msg, ui_x + 50, ui_y + 50, CANVAS_WIDTH - 100, CANVAS_HEIGHT - 100);
    }
  }
}