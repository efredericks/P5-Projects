// Simplex noise library:
// Tracery: http://tracery.io/
// Kenney 1-bit asset pack: https://www.kenney.nl/assets/bit-pack

// Intro music: Joel Steudler; www.patreon.com/joelsteudler; joel@joelsteudlermusic.com (Menu - Bringer of Doom)

/// globals
var SCENES;
var CURRENT_SCENE;

var INTRO_CTR;
var INTRO_SFX;

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

var ui_x;
var ui_y;

var NUM_CHUNKS;
var chunkIndex;
var subChunkIndex;
var currentLevelActive; // 0-overworld, 1-subworld

var eventActive;

/// sprites
var spriteSheet;
var envSprites;

// npcSprites is the group for ALL sprites
// chunkNPCSprites gets dynamically added/removed from for collisions and updates
var npcSprites;
var chunkNPCSprites;

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
var event_grammar;

/// map
var subMap;
var gameMap;
var treeMap; // lookup table for trees
var burnMap; // lookup table for fires
const TILES = {
  WALL: 0,
  GROUND: 1,
  FOLIAGE: 2,
  WATER: 3,
  TREE: 4, //4-11 is trees
  BEACH: 12,
  BRICK: 13,
  WATER_ANIM: 14,
  BURN_ANIM: 15,
  TOWN: 16,
  GROUND_SPECIAL: 17,
  CAMPFIRE: 18,
  CAMPFIRE_ANIM: 19,
  CAMPFIRE_SURROUND: 20,
  BURN_ANIM2: 21,
  SHIFT_SCREEN_LEFT: 22,
  SHIFT_SCREEN_RIGHT: 23,
};
//var tileIndices;
var tilePositions;
var noiseGen;

var recentKeyPress;

//var keyPressDelay;

// keyboard config
/*
var KEYBOARD_CONFIG = {
  // movement
  "up": [UP_ARROW, "k"],
  "down": [DOWN_ARROW, "j"],
  "left": [LEFT_ARROW, "h"],
  "right": [RIGHT_ARROW, "l"],
  "up-right": ["u"],
  "up-left": ["y"],
  "down-right": ["n"],
  "down-left": ["b"],
};
*/

/// helper functions

// via https://stackoverflow.com/questions/59919642/p5-js-how-can-i-make-text-appear-when-my-mouse-hovers-over-a-different-text-ele
/*function textExpand(textMain, textAdd, textX, textY, textH) {
      textSize(textH);
      text(textMain, textX, textY);
      textW = textWidth(textMain)
      if (mouseX > textX && mouseX < textX+textW && mouseY < textY && mouseY > textY-textH) {
          text(textAdd, textX, textY+5+textH);
      }
}*/

// https://www.webtips.dev/webtips/javascript/how-to-clamp-numbers-in-javascript
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getTile(_chunk, _row, _col) {
  return gameMap[_chunk][_row][_col]['type'];
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

function checkMove(curr_pos, curr_chunk, dir) {
  let _rc = getRowCol(curr_pos.x, curr_pos.y);
  let _r = _rc['row'];
  let _c = _rc['col'];

  if (dir == 'left')
    _c--;
  else if (dir == 'right')
    _c++;
  else if (dir == 'up')
    _r--
  else if (dir == 'down')
    _r++;
  else
    console.log("checkMove: something went wrong here");

  if ((_c >= 0) && (_c <= (MAP_COLS - 1)) && (_r >= 0) && (_r <= (MAP_ROWS - 1))) {
    let _tile = getTile(curr_chunk, _r, _c);//gameMap[curr_chunk][_r][_c]['type'];

    // non-walkable
    if (_tile == TILES.WALL)
      return { 'state': false, 'pos': null };


    //if ((_tile == TILES.WATER) || (_tile == TILES.WATER_ANIM)) // unwalkable
    //  return { 'state': false, 'pos': null };

    return { 'state': true, 'pos': getSpritePosition(_r, _c) };
  } else {
    return { 'state': false, 'pos': null };
  }

  /*
if ((_c == 0) || (_c >= (MAP_COLS-1)) || (_r == 0) || (_r >= (MAP_ROWS-1))) // out of bounds
  return {'state':false, 'pos':null};
else if (gameMap[curr_chunk][_r][_c]['type'] == 'wall') // cannot enter this spot
  return {'state':false, 'pos':null};
else {
  let pos = getSpriteOffset(_r, _c);
  return {'state':true, 'pos': pos};
}
*/
}
function getSpritePosition(row, col) {
  let dx = (int)(col * TILE_WIDTH + TILE_WIDTH / 2);
  let dy = (int)(row * TILE_HEIGHT + TILE_HEIGHT / 2);
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

    //console.log(npcSprites);
    // this doesn't work on all chunks!
    for (let _i = 0; _i < npcSprites.length; _i++) {
      if (npcSprites[_i].questGiver) {
        npcSprites[_i].quest["done"] = true;
        npcSprites[_i].ai = "wander";
      }
    }
  }
}


// collide with an NPC
function collideNPC(e, p) {
  if (chunkIndex == e.chunk) {
    activeNPCString = e.vipTitle + " " + e.name + ", " + e.occupation + " [" + e.mood + "]";
    activeNPCStringTimer = activeNPCStringTime;

    console.log(e);

    if (e.questGiver) { // display message 
      if (e.quest["done"])
        activeNPCString += " : " + e.quest["thanks"];
      else
        activeNPCString += " : " + e.quest["quest"];
    } else if (e.quest["quest"] == "body") {
      activeNPCString += npc.quest["questDialogue"][npc.dialogue_index];
      npc.dialogue_index++;
      if (npc.dialogue_index >= npc.quest["questDialogue"].length)
        npc.dialogue_index = 0;
    }
    //textSize(24);
    //fill(255);
    //text(e.name + ": how's it goin?", e.position.x + 10, e.position.y - 10);
    //console.log(npc.name + '\n' + npc.mood + '\n' + npc.vipTitle + '\n' + npc.occupation);
  }
}

function drawUI() {
  // top bar
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

  // bottom bar
  let ui_y2 = camera.position.y + CANVAS_HEIGHT / 2 - 30;
  fill(color(0, 0, 0, 127));
  rect(ui_x, ui_y2, CANVAS_WIDTH, 30);

  let _rc = getRowCol(player.position.x, player.position.y);
  let _tile = gameMap[chunkIndex][_rc['row']][_rc['col']];
  fill(255);
  textSize(24);
  text(_tile.desc, ui_x + 5, ui_y2 + 24);



  // update info box
  /*
  let _txt = select("#info");
  let _rc = getRowCol(player.position.x, player.position.y);
  let _tile = gameMap[chunkIndex][_rc['row']][_rc['col']];
  _txt.html(_tile.desc);
  */
}


// load all image assets first!
function preload() {
  // procgen stuff
  noiseGen = new FastSimplexNoise({ frequency: 0.01, octaves: 4 });
  npc_grammar = tracery.createGrammar(grammars["npcs"]);
  env_grammar = tracery.createGrammar(grammars["environments"]);
  event_grammar = tracery.createGrammar(grammars["event_dialogue"]);

  // sounds
  INTRO_SFX = loadSound("assets/sfx/Menu_-_Bringer_Of_Doom.ogg");

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
    13: { 'row': 15, 'col': 7 }, // brick
    14: { 'row': 22, 'col': 0 },  // water animation
    15: { 'row': 22, 'col': 1 }, // burn animation
    16: { 'row': 19, 'col': 0 }, // town sprite (make them special for each town so player knows)
    17: { 'row': 0, 'col': 4 }, // dirt surrounding town
    18: { 'row': 10, 'col': 14 }, // campfire
    19: { 'row': 22, 'col': 3 }, // campfire anim
    20: { 'row': 22, 'col': 4 }, // campfire dirt
    21: { 'row': 22, 'col': 2 }, // burn animation 2
    22: { 'row': 20, 'col': 26 }, // shift screen left tile
    23: { 'row': 20, 'col': 24 }, // shift screen right tile
  };
  TREE_SPRITE_START = 4;
  TREE_SPRITE_END = 11;


  // setup sprites
  pickupSprites = new Group();
  envSprites = new Group();
  npcSprites = new Group();
  chunkNPCSprites = new Group();

  let kenneyPath = "assets/1bitpack_kenney_1.1/Tilesheet/colored_packed_modified.png";
  //spriteSheet    = loadSpriteSheet(kenneyPath, 16, 16, 1056);
  spriteSheet = loadImage(kenneyPath);
  playerImg = loadImage("assets/separate/player.png");
  npcImg = loadImage("assets/separate/npc.png");


  // crab
  blueCrab = createSprite(100, 100, TILE_WIDTH, TILE_HEIGHT);
  let blueCrabAnim = blueCrab.addAnimation("jaunting", "assets/separate/bcrab1.png", "assets/separate/bcrab2.png");
  blueCrabAnim.frameDelay = 12;
  blueCrab.chunk = 1;
  blueCrab.setCollider('rectangle', 3, 3, TILE_WIDTH - 3, TILE_HEIGHT - 3); // avoid 'next cell' collision
  pickupSprites.add(blueCrab);

  //18,7 (blue crab?)
  //20,7
}

// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
// things to save:
// random seed
//   quest states 
//   npcs
//   town locations
//   pickup locations
//   player
function saveGameState() {
  ;
}
function loadGameState() {
  ;
}

function setup() {
  // set globals per https://github.com/processing/p5.js/wiki/p5.js-overview#why-cant-i-assign-variables-using-p5-functions-and-variables-before-setup
  SCENES = {
    PRELOAD: 0,
    INTRO: 1,
    MAIN_MENU: 2,
    GAME: 3,
    PAUSED: 4,
    GAME_OVER: 5
  };
  CURRENT_SCENE = SCENES.INTRO;//PRELOAD;
  INTRO_CTR = 255;

  TILE_WIDTH = 16;
  TILE_HEIGHT = 16;
  NUM_SPRITE_ROWS = 22;
  NUM_SPRITE_COLS = 48;

  MAP_WIDTH = 2048;//1024;
  MAP_HEIGHT = 2048;//1024;
  MAP_COLS = (int)(MAP_WIDTH / TILE_WIDTH);
  MAP_ROWS = (int)(MAP_HEIGHT / TILE_HEIGHT);

  //CANVAS_WIDTH = 800;
  //CANVAS_HEIGHT = 608;
  CANVAS_WIDTH = windowWidth;
  CANVAS_HEIGHT = windowHeight;
  CANVAS_COLS = (int)(CANVAS_WIDTH / TILE_WIDTH);
  CANVAS_ROWS = (int)(CANVAS_HEIGHT / TILE_HEIGHT);

  CANVAS_UI_WIDTH = 200;
  CANVAS_UI_HEIGHT = CANVAS_HEIGHT;

  NUM_CHUNKS = 4;//100;
  chunkIndex = 1; // start in middle
  currentLevelActive = 0; // overworld active
  subChunkIndex = 0;

  CHARACTER_INDEX = 99
  NPC_INDEX = 98
  ENV_INDEX = 0

  // handle key repeating
  recentKeyPress = 0;
  //keyPressDelay = 5;

  eventActive = false;

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
  player.speed = 1;  // # of tiles to speed through
  player.speedCtr = 0;  // ramp up speed
  player.addImage(playerImg);

  // place crab
  let _bc_c = 5;
  let _bc_r = 5;
  blueCrab.position.x = _bc_c * TILE_WIDTH + (TILE_WIDTH / 2);
  blueCrab.position.y = _bc_r * TILE_HEIGHT + (TILE_HEIGHT / 2);


  // environment
  treeMap = [];
  burnMap = [];
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
          _obj = { "type": TILES.WALL, "desc": "Impassable wall" };
        else {
          let _noise = noiseGen.get2DNoise(_c + randomOffset, _r + randomOffset);
          if (_noise < 0)
            _obj = { "type": TILES.GROUND, "desc": env_grammar.flatten("#ground#") };
          else if (_noise < 0.1)
            _obj = { "type": TILES.BEACH, "desc": env_grammar.flatten("#beach#") };
          else if (_noise < 0.2) {
            if (random() > 0.90)
              _obj = { "type": TILES.WATER_ANIM, "desc": env_grammar.flatten("#water#") };
            else
              _obj = { "type": TILES.WATER, "desc": env_grammar.flatten("#water#") };

          } else if (_noise < 0.25)
            _obj = { "type": TILES.BEACH, "desc": env_grammar.flatten("#beach#") };
          else if (_noise < 0.4) {
            _obj = { "type": getRandomInteger(TREE_SPRITE_START, TREE_SPRITE_END + 1), "desc": env_grammar.flatten("#trees#") };
            treeMap.push({ 'chunk': _chunk, 'row': _r, 'col': _c }); // lookup table
          } else if (_noise < 0.5)
            _obj = { "type": TILES.FOLIAGE, "desc": env_grammar.flatten("#foliage#") };
          else
            _obj = { "type": TILES.GROUND, "desc": env_grammar.flatten("#ground#") };
        }
        gameMap[_chunk][_r].push(_obj);
      }
    }
  }

  // place towns -- these should be sprites?
  let _townChunk = getRandomInteger(0, NUM_CHUNKS);
  let _t_col = getRandomInteger(2, MAP_COLS - 2);
  let _t_row = getRandomInteger(2, MAP_ROWS - 2);
  let _t_tile = getTile(_townChunk, _t_row, _t_col);// gameMap[_townChunk][_t_row][_t_col]['type'];
  while ((_t_tile == TILES.WATER) || (_t_tile == TILES.WATER_ANIM)) {
    _townChunk = getRandomInteger(0, NUM_CHUNKS);
    _t_col = getRandomInteger(2, MAP_COLS - 2);
    _t_row = getRandomInteger(2, MAP_ROWS - 2);
    _t_tile = getTile(_townChunk, _t_row, _t_col);// gameMap[_townChunk][_t_row][_t_col]['type'];
  }
  console.log("Town: ", _townChunk, _t_row, _t_col);
  gameMap[_townChunk][_t_row][_t_col]['type'] = TILES.TOWN;

  // left col
  gameMap[_townChunk][_t_row - 1][_t_col - 1]['type'] = TILES.GROUND_SPECIAL;
  gameMap[_townChunk][_t_row][_t_col - 1]['type'] = TILES.GROUND_SPECIAL;
  gameMap[_townChunk][_t_row + 1][_t_col - 1]['type'] = TILES.GROUND_SPECIAL;
  // right col
  gameMap[_townChunk][_t_row - 1][_t_col + 1]['type'] = TILES.GROUND_SPECIAL;
  gameMap[_townChunk][_t_row][_t_col + 1]['type'] = TILES.GROUND_SPECIAL;
  gameMap[_townChunk][_t_row + 1][_t_col + 1]['type'] = TILES.GROUND_SPECIAL;
  // top/bottom
  gameMap[_townChunk][_t_row - 1][_t_col]['type'] = TILES.GROUND_SPECIAL;
  gameMap[_townChunk][_t_row + 1][_t_col]['type'] = TILES.GROUND_SPECIAL;

  // place a campfire
  let _campfireChunk = getRandomInteger(0, NUM_CHUNKS);
  let _cf_col = getRandomInteger(2, MAP_COLS - 2);
  let _cf_row = getRandomInteger(2, MAP_ROWS - 2);
  _t_tile = getTile(_campfireChunk, _cf_row, _cf_col);// gameMap[_campfireChunk][_cf_row][_cf_col]['type'];
  while ((_t_tile == TILES.WATER) || (_t_tile == TILES.WATER_ANIM)) {
    _campfireChunk = getRandomInteger(0, NUM_CHUNKS);
    _cf_col = getRandomInteger(2, MAP_COLS - 2);
    _cf_row = getRandomInteger(2, MAP_ROWS - 2);
    _t_tile = getTile(_campfireChunk, _cf_row, _cf_col);// gameMap[_campfireChunk][_cf_row][_cf_col]['type'];
  }
  console.log("Campfire: ", _campfireChunk, _cf_row, _cf_col);
  gameMap[_campfireChunk][_cf_row][_cf_col]['type'] = TILES.CAMPFIRE;
  gameMap[_campfireChunk][_cf_row][_cf_col]['desc'] = "That's a bit warm, don't you think?";

  // left col
  let _ms = "Rocks separate the cheerily glowing campfire from anything that can catch fire"
  gameMap[_campfireChunk][_cf_row - 1][_cf_col - 1]['type'] = TILES.CAMPFIRE_SURROUND;
  gameMap[_campfireChunk][_cf_row - 1][_cf_col - 1]['desc'] = _ms;
  gameMap[_campfireChunk][_cf_row][_cf_col - 1]['type'] = TILES.CAMPFIRE_SURROUND;
  gameMap[_campfireChunk][_cf_row][_cf_col - 1]['desc'] = _ms;
  gameMap[_campfireChunk][_cf_row + 1][_cf_col - 1]['type'] = TILES.CAMPFIRE_SURROUND;
  gameMap[_campfireChunk][_cf_row + 1][_cf_col - 1]['desc'] = _ms;
  // right col
  gameMap[_campfireChunk][_cf_row - 1][_cf_col + 1]['type'] = TILES.CAMPFIRE_SURROUND;
  gameMap[_campfireChunk][_cf_row - 1][_cf_col + 1]['desc'] = _ms;
  gameMap[_campfireChunk][_cf_row][_cf_col + 1]['type'] = TILES.CAMPFIRE_SURROUND;
  gameMap[_campfireChunk][_cf_row][_cf_col + 1]['desc'] = _ms;
  gameMap[_campfireChunk][_cf_row + 1][_cf_col + 1]['type'] = TILES.CAMPFIRE_SURROUND;
  gameMap[_campfireChunk][_cf_row + 1][_cf_col + 1]['desc'] = _ms;
  // top/bottom
  gameMap[_campfireChunk][_cf_row - 1][_cf_col]['type'] = TILES.CAMPFIRE_SURROUND;
  gameMap[_campfireChunk][_cf_row - 1][_cf_col]['desc'] = _ms;
  gameMap[_campfireChunk][_cf_row + 1][_cf_col]['type'] = TILES.CAMPFIRE_SURROUND;
  gameMap[_campfireChunk][_cf_row + 1][_cf_col]['desc'] = _ms;
  //CAMPFIRE: 18,
  //CAMPFIRE_ANIM: 19,
  //CAMPFIRE_SURROUND: 20,

  // place portals to next chunk
  let _mid_row = (int)(MAP_ROWS / 2);
  for (let _i = 0; _i < NUM_CHUNKS; _i++) {
    if (_i > 0) {
      gameMap[_i][_mid_row][0]['type'] = TILES.SHIFT_SCREEN_LEFT;
      gameMap[_i][_mid_row - 1][0]['type'] = TILES.SHIFT_SCREEN_LEFT;
      gameMap[_i][_mid_row + 1][0]['type'] = TILES.SHIFT_SCREEN_LEFT;

      gameMap[_i][_mid_row][0]['desc'] = "";
      gameMap[_i][_mid_row - 1][0]['desc'] = "";
      gameMap[_i][_mid_row + 1][0]['desc'] = "";
    }

    if (_i < (NUM_CHUNKS - 1)) {
      gameMap[_i][_mid_row][MAP_COLS - 1]['type'] = TILES.SHIFT_SCREEN_RIGHT;
      gameMap[_i][_mid_row - 1][MAP_COLS - 1]['type'] = TILES.SHIFT_SCREEN_RIGHT;
      gameMap[_i][_mid_row + 1][MAP_COLS - 1]['type'] = TILES.SHIFT_SCREEN_RIGHT;


      gameMap[_i][_mid_row][MAP_COLS - 1]['desc'] = "";
      gameMap[_i][_mid_row - 1][MAP_COLS - 1]['desc'] = "";
      gameMap[_i][_mid_row + 1][MAP_COLS - 1]['desc'] = "";
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

  // npc
  let questGiver = getRandomInteger(0, numGenericNPCs);
  for (let _n = 0; _n < numGenericNPCs + 1; _n++) {
    let _c = getRandomInteger(1, MAP_COLS - 1);
    let _r = getRandomInteger(1, MAP_ROWS - 1);

    if (_n == numGenericNPCs) { // campfire friend
      _r = _cf_row;
      _c = _cf_col;
    }

    npc = createSprite((TILE_WIDTH * _c) + (TILE_WIDTH / 2), (TILE_HEIGHT * _r) + (TILE_HEIGHT / 2), TILE_WIDTH, TILE_HEIGHT);
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
    npc.dialogue_index = 0;

    if (_n == questGiver) {
      npc.questGiver = true;
      npc.ai = "follow";
      console.log("Questy McQuesterson on: " + npc.chunk);
      npc.quest = {
        "quest": "Have you seen my BLUE CRAB?", // make this a list?
        "thanks": "Thanks m8",
        "done": false
      };
    } else if (_n == numGenericNPCs) { // last one hangs by the campfire
      npc.questGiver = false;
      npc.ai = "loiter";
      npc.chunk = _campfireChunk;
      npc.quest = {
        "quest": "body", // make this a list?
        "questDialogue": [
          event_grammar.flatten("#campfire1#"), 
          event_grammar.flatten("#campfire2#"), 
          event_grammar.flatten("#campfire3#"), 
          event_grammar.flatten("#campfire4#"), 
          event_grammar.flatten("#campfire5#"), 
          event_grammar.flatten("#campfire6#"), 
          event_grammar.flatten("#campfire7#"), 
        ],
        "thanks": "Thanks m8",
        "done": false
      };
      console.log(npc.quest["questDialogue"]);

    } else {
      npc.questGiver = false;
      npc.ai = "wander";
    }

    npc.draw = function () {
      if (chunkIndex == this.chunk) {
        if (this.questGiver)
          rect(this.deltaX * 2, this.deltaY * 2, this.width + 5, this.height + 5);
        image(npcImg, this.deltaX * 2, this.deltaY * 2);
      }
    }
    npc.update = function () {
      if ((chunkIndex == this.chunk) && (!paused)) { // only update on current chunk / not paused
        chunkNPCSprites.add(this);

        // update based on AI type
        if (this.ai == "wander") {
          if (random() > 0.9) { // decide to move

            // pick a direction
            let _dirs = ["up", "down", "left", "right"];
            let _retval = checkMove(this.position, chunkIndex, _dirs[Math.floor(Math.random() * _dirs.length)])
            if (_retval['state']) { // true -- move
              this.position.x = _retval['pos']['dx'];
              this.position.y = _retval['pos']['dy'];
            }
          }
        } else if (this.ai == "loiter") {
          ;

        } else if (this.ai == "follow") {
          // https://stackoverflow.com/questions/20044791/how-to-make-an-enemy-follow-the-player-in-pygame
          if (random() > 0.8) { // move towards player
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
        }
      } else // remove from colliders
        chunkNPCSprites.remove(this);
    }
    npcSprites.add(npc);
  }




  // touch controls
  /*
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
  */

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
  else if (key == "p") {
    eventActive = !eventActive;
    // perhaps add a lookup table to just pick a random index?

    let _cnt = 1;
    while (_cnt > 0) {
      let _ti = getRandomInteger(0, treeMap.length);
      let _t = treeMap[_ti];
      let _chunk = _t['chunk'];
      let _row = _t['row'];
      let _col = _t['col'];

      gameMap[_chunk][_row][_col]['type'] = TILES.BURN_ANIM;
      gameMap[_chunk][_row][_col]['desc'] = "The trees are afire";
      burnMap.push({ 'chunk': _chunk, 'row': _row, 'col': _col }); // lookup table
      _cnt--;

      activeNPCString = "FIRE AT [" + _chunk + "][" + _row + "][" + _col + "]";
      activeNPCStringTimer = activeNPCStringTime;

    }
  }
  else if (key == "q") { // query the local space
    paused = !paused;

    if (paused) {
      let _rc = getRowCol(player.position.x, player.position.y);
      activeTile = _rc//gameMap[chunkIndex][_rc['row']][_rc['col']];
    } else
      activeTile = null;
  }
  /*
  else {
    if 

  }*/
}

function draw() {
  switch (CURRENT_SCENE) {
    case SCENES.PRELOAD:
      requireClick();
      break;
    case SCENES.INTRO:
      intro();
      break;
    case SCENES.MAIN_MENU:
    case SCENES.GAME:
    case SCENES.PAUSED:
    case SCENES.GAME_OVER:
    default:
      mainGame();
      break;
  }
}

function mainGame() {
  let _move = {
    'left': false,
    'right': false,
    'up': false,
    'down': false
  };

  /// draw functions
  background(71, 45, 60);

  if (currentLevelActive == 0) {
    for (let _r = 0; _r < MAP_ROWS; _r++) {
      for (let _c = 0; _c < MAP_COLS; _c++) {
        //https://github.com/processing/p5.js/issues/1567
        //image(img,[sx=0],[sy=0],[sWidth=img.width],[sHeight=img.height],[dx=0],[dy=0],[dWidth],[dHeight])


        // randomly animate water -- this probably would be better abstracted later on to encapsulate tile animations (otherwise we're going to get deep into if statements)
        let _tile = getTile(chunkIndex, _r, _c); // gameMap[chunkIndex][_r][_c]['type'];
        if ((_tile == TILES.WATER) || (_tile == TILES.WATER_ANIM)) {
          if (random() > 0.99) {
            if (_tile == TILES.WATER) {
              gameMap[chunkIndex][_r][_c]['type'] = TILES.WATER_ANIM;
              _tile = TILES.WATER_ANIM;
            } else {
              gameMap[chunkIndex][_r][_c]['type'] = TILES.WATER;
              _tile = TILES.WATER;
            }
          } else {
            if ((random() > 0.85) && (_tile == TILES.WATER_ANIM)) {
              gameMap[chunkIndex][_r][_c]['type'] = TILES.WATER;
              _tile = TILES.WATER;
            }
          }
        }

        // randomly animate fire
        if ((_tile == TILES.CAMPFIRE) || (_tile == TILES.CAMPFIRE_ANIM)) {
          if ((frameCount % 10) == 0) {
            if (_tile == TILES.CAMPFIRE) {
              gameMap[chunkIndex][_r][_c]['type'] = TILES.CAMPFIRE_ANIM;
              _tile = TILES.CAMPFIRE_ANIM;
            } else {
              gameMap[chunkIndex][_r][_c]['type'] = TILES.CAMPFIRE;
              _tile = TILES.CAMPFIRE;
            }
          }
        }

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
    chunkNPCSprites.collide(player, collideNPC);
    pickupSprites.overlap(player, collidePickup);

    // update entities -- not needed?
    //npcSprites.forEach(elem => elem.update());
  }

  //  spriteSheet.drawFrame(getFrameIndex(14, 35), player.position.x, player.position.y);
  //drawSprites();

  if (chunkIndex == blueCrab.chunk)
    drawSprites(pickupSprites);
  drawSprites(npcSprites);
  drawSprite(player);


  drawUI();

  /// handle updates
  if (!paused) {
    // Event
    if (eventActive) {
      //console.log(burnMap);
      //      if (random() > 0.9) {
      let _bi = getRandomInteger(0, burnMap.length);
      let _burn = burnMap[_bi];
      let _burn_chunk = _burn['chunk'];
      let _burn_row = _burn['row'];
      let _burn_col = _burn['col'];

      //console.log(_burn);
      let _random_row = getRandomInteger(max(0, _burn_row - 1), min(_burn_row + 1, NUM_SPRITE_ROWS));
      let _random_col = getRandomInteger(max(0, _burn_col - 1), min(_burn_col + 1, NUM_SPRITE_COLS));

      if ((_burn_row != _random_row) && (_burn_col != _random_col)) { // not the same
        let _tile = getTile(_burn_chunk, _random_row, _random_col);
        if (((_tile >= TREE_SPRITE_START) && (_tile <= TREE_SPRITE_END)) || (_tile == TILES.FOLIAGE)) {
          gameMap[_burn_chunk][_random_row][_random_col]['type'] = TILES.BURN_ANIM;
          gameMap[_burn_chunk][_random_row][_random_col]['desc'] = "The trees are afire";
          burnMap.push({ 'chunk': _burn_chunk, 'row': _random_row, 'col': _random_col }); // lookup table
        }
      }

      // spread in a direction
      /*
      for (let _brow = max(_burn_row - 1, 0); _brow <= min(_burn_row + 1, NUM_SPRITE_ROWS-1); _brow++) {
        for (let _bcol = max(_burn_col - 1, 0); _bcol <= min(_burn_col + 1, NUM_SPRITE_COLS-1); _bcol++) {
          if ((_brow != _burn_row) || (_bcol != _burn_col)) { // not the same
            //if ((random() > 0.99) && ((gameMap[_burn_chunk][_brow][_bcol]['type'] >= TREE_SPRITE_START) && (gameMap[_burn_chunk][_brow][_bcol]['type'] <= TREE_SPRITE_END)))
            if (((gameMap[_burn_chunk][_brow][_bcol]['type'] >= TREE_SPRITE_START) && (gameMap[_burn_chunk][_brow][_bcol]['type'] <= TREE_SPRITE_END))) {
              gameMap[_burn_chunk][_brow][_bcol]['type'] = TILES.BURN_ANIM;
              burnMap.push({ 'chunk': _burn_chunk, 'row': _brow, 'col': _bcol }); // lookup table
            }
          }
        }
      }
//     }
*/
    }

    // NPC
    if (activeNPCStringTimer > 0) {
      activeNPCStringTimer--;
      if (activeNPCStringTimer <= 0) {
        activeNPCString = "";
        activeNPCStringTimer = 0;
      }
    }


    // p5play keyboard functions
    //  if (recentKeyPress == 0) {
    // this probably needs to be abstracted to its own thing
    let _moveDir = null;
    if (keyDown(UP_ARROW)) {
      _move['up'] = true;
      _moveDir = "up";
    }
    if (keyWentUp(UP_ARROW)) {
      _move['up'] = false;
      _moveDir = null;
    }
    //player.position.y -= TILE_HEIGHT;

    if (keyDown(DOWN_ARROW)) {
      _move['down'] = true;
      _moveDir = "down";
    }
    if (keyWentUp(DOWN_ARROW)) {
      _move['down'] = false;
      _moveDir = null;
    }
    //player.position.y += TILE_HEIGHT;

    if (keyDown(LEFT_ARROW)) {
      _move['left'] = true;
      _moveDir = "left";
    }
    if (keyWentUp(LEFT_ARROW)) {
      _move['left'] = false;
      _moveDir = null;
    }
    //player.position.x -= TILE_WIDTH;

    if (keyDown(RIGHT_ARROW)) {
      _move['right'] = true;
      _moveDir = "right";
    }
    if (keyWentUp(RIGHT_ARROW)) {
      _move['right'] = false;
      _moveDir = null;
    }
    //player.position.x += TILE_WIDTH;

    /*
  recentKeyPress = keyPressDelay;
} else { // debounce a bit
  recentKeyPress--;
  if (recentKeyPress <= 0)
    recentKeyPress = 0;
}*/


    // position updates
    if (_moveDir != null) {

      //      let _newpos = player.position;
      //     if (_move['left']) _newpos.x -= TILE_WIDTH * player.speed;
      //    if (_move['right']) _newpos.x += TILE_WIDTH * player.speed;
      //   if (_move['up']) _newpos.y -= TILE_HEIGHT * player.speed;
      //  if (_move['down']) _newpos.y += TILE_HEIGHT * player.speed;

      for (let _i = 0; _i < player.speed; _i++) {
        let _retval = checkMove(player.position, chunkIndex, _moveDir);
        if (_retval['state']) { // true -- move
          player.position.x = _retval['pos']['dx'];
          player.position.y = _retval['pos']['dy'];

          // special check for non-sprite interactions
          let _rc = getRowCol(player.position.x, player.position.y);
          let _tile = getTile(chunkIndex, _rc['row'], _rc['col']); //gameMap[chunkIndex][_rc['row']][_rc['col']]['type'];
          if (_tile == TILES.TOWN)
            currentLevelActive = 1;

          // tbd: abstract these a bit!
          if ((_tile == TILES.SHIFT_SCREEN_LEFT) && (chunkIndex > 0)) {
            chunkIndex--;

            let _p_rc = getRowCol(player.position.x, player.position.y);
            let _new_col = MAP_COLS - 2;

            let _new_pos = getSpritePosition(_p_rc['row'], _new_col);
            player.position.x = _new_pos['dx'];
            player.position.y = _new_pos['dy'];

            activeNPCString = "Chunk: " + chunkIndex;
            activeNPCStringTimer = activeNPCStringTime;
          }

          if ((_tile == TILES.SHIFT_SCREEN_RIGHT) && (chunkIndex < (NUM_CHUNKS - 1))) {
            chunkIndex++;

            let _p_rc = getRowCol(player.position.x, player.position.y);
            let _new_col = 1;

            let _new_pos = getSpritePosition(_p_rc['row'], _new_col);
            player.position.x = _new_pos['dx'];
            player.position.y = _new_pos['dy'];

            activeNPCString = "Chunk: " + chunkIndex;
            activeNPCStringTimer = activeNPCStringTime;
          }
        }
      }
      //player.position.y += TILE_HEIGHT * player.speed;
    }
    /*
    if (_move['up'])
      //player.position.y -= TILE_HEIGHT * player.speed;
    if (_move['left'])
      //player.position.x -= TILE_WIDTH * player.speed;
    if (_move['right'])
      //player.position.x += TILE_WIDTH * player.speed;
      */

    // increase velocity
    if (_move['down'] || _move['up'] || _move['left'] || _move['right']) {
      if (player.speedCtr < 10) {
        if (player.speedCtr < 5)
          player.speed = 1;
        else //if (player.speedCtr < 7)
          player.speed = 2;
        //else
        // player.speed = 3;

        player.speedCtr++;
      }
    }
    if (!_move['down'] && !_move['up'] && !_move['left'] && !_move['right']) {
      player.speedCtr = 0;
      player.speed = 1;
    }

    // clamp camera and draw player 
    camera.position.x = clamp(player.position.x, CANVAS_WIDTH * 0.5, MAP_WIDTH - CANVAS_WIDTH * 0.5);
    camera.position.y = clamp(player.position.y, CANVAS_HEIGHT * 0.5, MAP_HEIGHT - CANVAS_HEIGHT * 0.5);

    ui_x = camera.position.x - CANVAS_WIDTH / 2;
    ui_y = camera.position.y - CANVAS_HEIGHT / 2;



    // bounds
    /*
    if ((player.position.x - (TILE_WIDTH / 2)) <= TILE_WIDTH)
      player.position.x = TILE_WIDTH + (TILE_WIDTH / 2);
    else if ((player.position.x - (TILE_WIDTH / 2)) >= MAP_WIDTH - (TILE_WIDTH * 2))
      player.position.x = MAP_WIDTH - (TILE_WIDTH * 2) + (TILE_WIDTH / 2);

    if ((player.position.y - (TILE_HEIGHT / 2)) <= TILE_HEIGHT)
      player.position.y = TILE_HEIGHT + (TILE_HEIGHT / 2);
    else if ((player.position.y - (TILE_HEIGHT / 2)) >= MAP_HEIGHT - (TILE_HEIGHT * 2))
      player.position.y = MAP_HEIGHT - (TILE_HEIGHT * 2) + (TILE_HEIGHT / 2);
      */

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
      fill(color(0, 0, 0, 220));
      //let ui_x = camera.position.x - CANVAS_WIDTH / 2;
      //let ui_y = camera.position.y - CANVAS_HEIGHT / 2;
      //rect(ui_x + 50, ui_y + 50, CANVAS_WIDTH - 100, CANVAS_HEIGHT - 100);
      rect(player.position.x + 5, player.position.y - 55, 150, 50);

      // info
      /*
      fill(255);
      textSize(14);
      textFont("New Tegomin");
      let _tile = gameMap[chunkIndex][activeTile['row']][activeTile['col']];
      let msg = _tile.desc;
      text(msg, player.position.x + 8, player.position.y - 50, 150, 45);
      //text(msg, ui_x + 50, ui_y + 50, CANVAS_WIDTH - 100, CANVAS_HEIGHT - 100);
      */
    }
  }
}

function requireClick() {
  background(0);
  textSize(18);

  fill(color(255, 255, 255, INTRO_CTR));
  textAlign(CENTER);
  text("Click mouse to focus", 0, CANVAS_HEIGHT / 2, CANVAS_WIDTH);

  if (mouseIsPressed) {
    INTRO_SFX.play();
    CURRENT_SCENE = SCENES.INTRO;
  }
}

function intro() {
  background(0);
  textSize(24);

  fill(color(255, 255, 255, INTRO_CTR));
  textAlign(CENTER);
  text("WELCOME TO COZYRL GAME OF THE YEAR 20k21", 0, CANVAS_HEIGHT / 2, CANVAS_WIDTH);

  if (frameCount > 25) {
    INTRO_CTR -= 5;
    if (INTRO_CTR <= 0) {
      CURRENT_SCENE = SCENES.GAME;
      INTRO_SFX.setVolume(0, 5);
    }
  }
}