/// globals
var CURRENT_SCENE;
var PRIOR_SCENE;

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
var TOWN_ROWS; // same size for all towns for now
var TOWN_COLS;

// player's last position on the overworld
var PRIOR_CHUNK;
var PRIOR_ROW;
var PRIOR_COL;

var CANVAS_WIDTH;
var CANVAS_HEIGHT;
var CANVAS_COLS;
var CANVAS_ROWS;

var ui_x;
var ui_y;

var NUM_CHUNKS;
var NUM_TOWN_CHUNKS;
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
var splash_grammar;
var startupMsg;

/// map
var subMap;
var gameMap;
var treeMap; // lookup table for trees
var burnMap; // lookup table for fires


const SCENES = {
  PRELOAD: 0,
  INTRO: 1,
  MAIN_MENU: 2,
  GAME: 3,
  PAUSED: 4,
  INVENTORY: 5,
  GAME_OVER: 6
};

// NUM_CHUNKS + TOWN_CHUNKS = CHUNK (make sure added in order) --> could make this a dict to be smarter later on
const TOWN_CHUNKS = {
  FARMHILL: 0,
  LUB: 1,
  MORTE: 2,
  AUBER: 3,
}

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
  PAVEMENT: 24,
  DOCK: 25,
  DOCK2: 26,
};
const tilePositions = {
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
  24: { 'row': 13, 'col': 0 }, // pavement
  25: { 'row': 22, 'col': 5 }, // dock
  26: { 'row': 22, 'col': 6 }, // dock2
  //25: { 'row': 5, 'col': 16 }, // dock
};
const TREE_SPRITE_START = 4;
const TREE_SPRITE_END = 11;

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