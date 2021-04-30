// Simplex noise library:
// Tracery: http://tracery.io/
// Kenney 1-bit asset pack: https://www.kenney.nl/assets/bit-pack

// Intro music: Joel Steudler; www.patreon.com/joelsteudler; joel@joelsteudlermusic.com (Menu - Bringer of Doom)


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


function getTileType(_chunk, _row, _col) {
  return gameMap[_chunk][_row][_col]['type'];
}
function getTile(_chunk, _row, _col) {
  return gameMap[_chunk][_row][_col];
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

function checkMove(curr_pos, curr_chunk, dirs) {
  let _rc = getRowCol(curr_pos.x, curr_pos.y);
  let _r = _rc['row'];
  let _c = _rc['col'];

  if (dirs['left'])
    _c--;
  if (dirs['right'])
    _c++;
  if (dirs['up'])
    _r--
  if (dirs['down'])
    _r++;

  // add sliding!
  // fix if NPC is next to you - stop motion otherwise you pass through
  /*
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
    */
  let _map_rows = MAP_ROWS;
  let _map_cols = MAP_COLS;
  if (chunkIndex >= NUM_CHUNKS) {
    _map_rows = TOWN_ROWS;
    _map_cols = TOWN_COLS;
  }

  if ((_c >= 0) && (_c <= (_map_cols - 1)) && (_r >= 0) && (_r <= (_map_rows - 1))) {
    let _tile = getTileType(curr_chunk, _r, _c);//gameMap[curr_chunk][_r][_c]['type'];

    // non-walkable
    if (_tile == TILES.WALL)
      return { 'state': false, 'pos': null };
    if ((_tile == TILES.WATER) || (_tile == TILES.WATER_ANIM)) // slow
      return { 'state': true, 'pos': getSpritePosition(_r, _c), 'speed': 1 };
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
  splash_grammar = tracery.createGrammar(grammars["splash"]);

  // sounds
  INTRO_SFX = loadSound("assets/sfx/Menu_-_Bringer_Of_Doom.ogg");

  // setup sprites
  pickupSprites = new Group();
  envSprites = new Group();
  npcSprites = new Group();
  chunkNPCSprites = new Group();

  let kenneyPath = "assets/1bitpack_kenney_1.1/Tilesheet/colored_packed_modified.png";
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

function storeLastPosition(_chunk, _pos) {
  PRIOR_CHUNK = _chunk;
  let _rc = getRowCol(_pos.x, _pos.y);
  PRIOR_ROW = _rc['row'];
  PRIOR_COL = _rc['col'];
}

function setup() {
  // set globals per https://github.com/processing/p5.js/wiki/p5.js-overview#why-cant-i-assign-variables-using-p5-functions-and-variables-before-setup
  CURRENT_SCENE = SCENES.INTRO;//PRELOAD;
  PRIOR_SCENE = SCENES.GAME; // only used during gameplay
  INTRO_CTR = 255;

  TILE_WIDTH = 16;
  TILE_HEIGHT = 16;
  NUM_SPRITE_ROWS = 22;
  NUM_SPRITE_COLS = 48;

  MAP_WIDTH = 2048;//1024;
  MAP_HEIGHT = 2048;//1024;
  MAP_COLS = (int)(MAP_WIDTH / TILE_WIDTH);
  MAP_ROWS = (int)(MAP_HEIGHT / TILE_HEIGHT);

  TOWN_ROWS = 100;
  TOWN_COLS = 100;

  //CANVAS_WIDTH = 800;
  //CANVAS_HEIGHT = 608;
  CANVAS_WIDTH = windowWidth;
  CANVAS_HEIGHT = windowHeight;
  CANVAS_COLS = (int)(CANVAS_WIDTH / TILE_WIDTH);
  CANVAS_ROWS = (int)(CANVAS_HEIGHT / TILE_HEIGHT);

  CANVAS_UI_WIDTH = 200;
  CANVAS_UI_HEIGHT = CANVAS_HEIGHT;

  NUM_CHUNKS = 4;//100;
  NUM_TOWN_CHUNKS = 4;
  chunkIndex = 1; // start in middle
  currentLevelActive = 0; // overworld active
  subChunkIndex = 0;

  CHARACTER_INDEX = 99
  NPC_INDEX = 98
  ENV_INDEX = 0

  // handle key repeating

  eventActive = false;

  paused = false; // game pause

  activeTile = null; // display tile info

  activeNPCString = "";
  activeNPCStringTimer = 0;
  activeNPCStringTime = 200; // delay to show on ui

  numGenericNPCs = 10; // number of NPCs to generate randomly in the overworld (flavor NPCs)

  /// canvas setup
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  background(0);

  startupMsg = splash_grammar.flatten("#origin#");


  // player [col:35, row: 14]
  player = createSprite((TILE_WIDTH * 2) + (TILE_WIDTH / 2), (TILE_HEIGHT * 2) + (TILE_HEIGHT / 2), TILE_WIDTH, TILE_HEIGHT);
  player.depth = CHARACTER_INDEX;
  player.speed = 1;  // # of tiles to speed through
  player.speedCtr = 0;  // ramp up speed
  player.addImage(playerImg);
  player.inventory = [];

  // save players position before transitioning
  storeLastPosition(chunkIndex, player.position);

  // place crab
  let _bc_c = 5;
  let _bc_r = 5;
  blueCrab.position.x = _bc_c * TILE_WIDTH + (TILE_WIDTH / 2);
  blueCrab.position.y = _bc_r * TILE_HEIGHT + (TILE_HEIGHT / 2);


  // environment
  treeMap = [];
  burnMap = [];
  gameMap = new Array(NUM_CHUNKS + NUM_TOWN_CHUNKS);
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
  let _t_tile = getTileType(_townChunk, _t_row, _t_col);// gameMap[_townChunk][_t_row][_t_col]['type'];
  while ((_t_tile == TILES.WATER) || (_t_tile == TILES.WATER_ANIM)) {
    _townChunk = getRandomInteger(0, NUM_CHUNKS);
    _t_col = getRandomInteger(2, MAP_COLS - 2);
    _t_row = getRandomInteger(2, MAP_ROWS - 2);
    _t_tile = getTileType(_townChunk, _t_row, _t_col);// gameMap[_townChunk][_t_row][_t_col]['type'];
  }
  console.log("Town: ", _townChunk, _t_row, _t_col);
  gameMap[_townChunk][_t_row][_t_col]['type'] = TILES.TOWN;
  gameMap[_townChunk][_t_row][_t_col]['nextChunk'] = TOWN_CHUNKS.FARMHILL;

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

  //////SETUP TOWNS (abstract away later)
  //
  let _chunk = NUM_CHUNKS + TOWN_CHUNKS.FARMHILL;
  gameMap[_chunk] = [];
  let randomOffset = getRandomInteger(0, 10000);
  let _town_mid_row = (int)(TOWN_ROWS / 2);
  let _town_mid_col = (int)(TOWN_COLS / 2);

  console.log(townLookupTable.farmhill.tiles.length);
  console.log(townLookupTable.farmhill.tiles[0].length);



  for (let _r = 0; _r < TOWN_ROWS; _r++) {
    gameMap[_chunk][_r] = [];
    for (let _c = 0; _c < TOWN_COLS; _c++) {
      let _obj = {};
      let _town_tile = townLookupTable.farmhill.tiles[_r][_c];
//      _obj = { "type": TILES.GROUND, "desc": env_grammar.flatten("#ground#") };

      if (_town_tile == "^")
        _obj = { "type": TILES.WATER, "desc": env_grammar.flatten("#water#") };
      else if (_town_tile == "*")
        _obj = { "type": TILES.BEACH, "desc": env_grammar.flatten("#beach#") };
      else if (_town_tile == "#")
        _obj = { "type": TILES.WALL, "desc": "Impassable wall" };
      else if (_town_tile == "<")
        _obj = { "type": TILES.SHIFT_SCREEN_LEFT, "desc": "" };
      else
        _obj = { "type": TILES.GROUND, "desc": env_grammar.flatten("#ground#") };

      gameMap[_chunk][_r].push(_obj);
    }
  }

  /*
  for (let _r = 0; _r < townLookupTable.farmhill.tiles.length; _r++) {
    gameMap[_chunk][_r] = [];
    for (let _c = 0; _c < townLookupTable.farmhill.tiles[0].length; _c++) {
      let _obj = {};
      let _t = townLookupTable.farmhill.tiles[_r][_c];
      if (_t == "^")
        _obj = { "type": TILES.WATER, "desc": env_grammar.flatten("#water#") };
      else if (_t == "*")
        _obj = { "type": TILES.BEACH, "desc": env_grammar.flatten("#beach#") };
      else if (_t == "#")
        _obj = { "type": TILES.WALL, "desc": "Impassable wall" };
      else if (_t == "<")
        _obj = { "type": TILES.SHIFT_SCREEN_LEFT, "desc": "" };
      else
        _obj = { "type": TILES.GROUND, "desc": env_grammar.flatten("#ground#") };

      gameMap[_chunk][_r].push(_obj);
    }
  }*/


  // for (let _r = 0; _r < TOWN_ROWS; _r++) {
  //   gameMap[_chunk][_r] = [];
  //   for (let _c = 0; _c < TOWN_COLS; _c++) {
  //     let _obj = {};
  //     if (((_c == 0) || (_c == (TOWN_COLS - 1))) ||
  //       ((_r == 0) || (_r == (TOWN_ROWS - 1)))) {
  //       _obj = { "type": TILES.WALL, "desc": "Impassable wall" };
  //       gameMap[_chunk][_r].push(_obj);
  //     } else {
  //       _obj = { "type": TILES.GROUND, "desc": env_grammar.flatten("#ground#") };
  //       gameMap[_chunk][_r].push(_obj);
  //       // load in town!
  //       /*
  //       for (let _y = 0; _y < TOWN_ROWS-2; _y++) {
  //         for (let _x = 0; _x < TOWN_COLS-2; _x++) {
  //           let _t = townLookupTable.farmhill.tiles[_y][_x]; 
  //           let _obj = {};
  //           if (_t == "^")
  //             _obj = { "type": TILES.WATER, "desc": env_grammar.flatten("#water#") };
  //           else if (_t == "*")
  //             _obj = { "type": TILES.BEACH, "desc": env_grammar.flatten("#beach#") };
  //           else
  //             _obj = { "type": TILES.GROUND, "desc": env_grammar.flatten("#ground#") };
  //           gameMap[_chunk][_r].push(_obj);
  //         }
  //       }
  //       */



  //       /*
  //       if ((_c == _town_mid_col) || (_c == (_town_mid_col + 1)) || (_c == (_town_mid_col - 1)) ||
  //         (_r == _town_mid_row) || (_r == (_town_mid_row + 1)) || (_r == (_town_mid_row - 1))) {
  //         _obj = { "type": TILES.PAVEMENT, "desc": env_grammar.flatten("#pavement#") };
  //       } else {
  //         */
  //       /*
  //       let _noise = noiseGen.get2DNoise(_c + randomOffset, _r + randomOffset);
  //       if (_noise < 0)
  //         _obj = { "type": TILES.GROUND, "desc": env_grammar.flatten("#ground#") };
  //       else if (_noise < 0.1)
  //         _obj = { "type": TILES.BEACH, "desc": env_grammar.flatten("#beach#") };
  //       else if (_noise < 0.2) {
  //         if (random() > 0.90)
  //           _obj = { "type": TILES.WATER_ANIM, "desc": env_grammar.flatten("#water#") };
  //         else
  //           _obj = { "type": TILES.WATER, "desc": env_grammar.flatten("#water#") };

  //       } else if (_noise < 0.25)
  //         _obj = { "type": TILES.BEACH, "desc": env_grammar.flatten("#beach#") };
  //       else if (_noise < 0.4) {
  //         _obj = { "type": getRandomInteger(TREE_SPRITE_START, TREE_SPRITE_END + 1), "desc": env_grammar.flatten("#trees#") };
  //         treeMap.push({ 'chunk': _chunk, 'row': _r, 'col': _c }); // lookup table
  //       } else if (_noise < 0.5)
  //         _obj = { "type": TILES.FOLIAGE, "desc": env_grammar.flatten("#foliage#") };
  //       else
  //       */
  //       //_obj = { "type": TILES.GROUND, "desc": env_grammar.flatten("#ground#") };

  //     }
  //     //gameMap[_chunk][_r].push(_obj);
  //   }
  // }
  // gameMap[NUM_CHUNKS][_town_mid_row][0]['type'] = TILES.SHIFT_SCREEN_LEFT;
  // gameMap[NUM_CHUNKS][_town_mid_row - 1][0]['type'] = TILES.SHIFT_SCREEN_LEFT;
  // gameMap[NUM_CHUNKS][_town_mid_row + 1][0]['type'] = TILES.SHIFT_SCREEN_LEFT;

  // gameMap[NUM_CHUNKS][_town_mid_row][0]['desc'] = "";
  // gameMap[NUM_CHUNKS][_town_mid_row - 1][0]['desc'] = "";
  // gameMap[NUM_CHUNKS][_town_mid_row + 1][0]['desc'] = "";
  /////////////////////////////////////




  // place a campfire
  let _campfireChunk = getRandomInteger(0, NUM_CHUNKS);
  let _cf_col = getRandomInteger(2, MAP_COLS - 2);
  let _cf_row = getRandomInteger(2, MAP_ROWS - 2);
  _t_tile = getTileType(_campfireChunk, _cf_row, _cf_col);// gameMap[_campfireChunk][_cf_row][_cf_col]['type'];
  while ((_t_tile == TILES.WATER) || (_t_tile == TILES.WATER_ANIM)) {
    _campfireChunk = getRandomInteger(0, NUM_CHUNKS);
    _cf_col = getRandomInteger(2, MAP_COLS - 2);
    _cf_row = getRandomInteger(2, MAP_ROWS - 2);
    _t_tile = getTileType(_campfireChunk, _cf_row, _cf_col);// gameMap[_campfireChunk][_cf_row][_cf_col]['type'];
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
      npc.questGiver = true;
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
            let _move = {};
            _move[_dirs[Math.floor(Math.random() * _dirs.length)]] = true;
            let _retval = checkMove(this.position, chunkIndex, _move);
            //_dirs[Math.floor(Math.random() * _dirs.length)]);
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
  else if (key == "i") {
    if (CURRENT_SCENE === SCENES.GAME) {
      PRIOR_SCENE = CURRENT_SCENE;
      CURRENT_SCENE = SCENES.INVENTORY;
    } else {
      if (CURRENT_SCENE === SCENES.INVENTORY) // lock to only P
        CURRENT_SCENE = PRIOR_SCENE;
    }
  }
  else if (key == "p") {
    if (CURRENT_SCENE === SCENES.GAME) {
      PRIOR_SCENE = CURRENT_SCENE;
      CURRENT_SCENE = SCENES.PAUSED;
    } else {
      if (CURRENT_SCENE === SCENES.PAUSED) // lock to only P
        CURRENT_SCENE = PRIOR_SCENE;
    }
    /*
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
    */
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
    case SCENES.PAUSED:
      frameRate(2);
      drawBackground();
      drawPause();
      break;
    case SCENES.INVENTORY:
      frameRate(2);
      drawBackground();
      drawInventory();
      break;
    case SCENES.MAIN_MENU:
    case SCENES.GAME:
    case SCENES.GAME_OVER:
    default:
      frameRate(20);
      drawBackground();
      mainGame();
      break;
  }
}

function fullScreenMsg(msg) {
  textSize(48);
  fill(color(0, 0, 0, 200));
  rect(camera.position.x - width / 2, camera.position.y - height / 2, camera.position.x + width / 2, camera.position.y + height / 2);
  fill(255);
  textAlign(CENTER, CENTER);
  text(msg, camera.position.x, camera.position.y);
}

// show your inventory
function drawInventory() {
  let _msg = "You have:";
  if (player.inventory.length === 0)
    _msg += " nothing";
  else {
    for (let _i = 0; _i < player.inventory.length; _i++)
      _msg += " [" + player.inventory[_i] + "]";
  }
  fullScreenMsg(_msg);
}

// show the pause menu
function drawPause() {
  fullScreenMsg("Game paused");
}

// handles the ambient animation
function drawBackground() {
  /// draw functions
  background(71, 45, 60);

  if (currentLevelActive == 0) {
    let _map_rows = MAP_ROWS;
    let _map_cols = MAP_COLS;
    if (chunkIndex >= NUM_CHUNKS) {
      _map_rows = TOWN_ROWS;
      _map_cols = TOWN_COLS;
    }

    for (let _r = 0; _r < _map_rows; _r++) {
      for (let _c = 0; _c < _map_cols; _c++) {
        //https://github.com/processing/p5.js/issues/1567
        //image(img,[sx=0],[sy=0],[sWidth=img.width],[sHeight=img.height],[dx=0],[dy=0],[dWidth],[dHeight])


        // randomly animate water -- this probably would be better abstracted later on to encapsulate tile animations (otherwise we're going to get deep into if statements)
        let _tile = getTileType(chunkIndex, _r, _c); // gameMap[chunkIndex][_r][_c]['type'];
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


}

function mainGame() {
  let _move = {
    'left': false,
    'right': false,
    'up': false,
    'down': false
  };

  if (!paused) {
    // interact
    chunkNPCSprites.displace(player, collideNPC);
    //chunkNPCSprites.collide(player, collideNPC);
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
        let _tile = getTileType(_burn_chunk, _random_row, _random_col);
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
    // this probably needs to be abstracted to its own thing
    let _moveDir = null;
    if (keyIsDown(UP_ARROW)) {
      _move['up'] = true;
      _moveDir = "up";
    } else {
      _move['up'] = false;
    }

    if (keyIsDown(DOWN_ARROW)) {
      _move['down'] = true;
      _moveDir = "down";
    } else {
      _move['down'] = false;
    }

    if (keyIsDown(LEFT_ARROW)) {
      _move['left'] = true;
      _moveDir = "left";
    } else {
      _move['left'] = false;
    }

    if (keyIsDown(RIGHT_ARROW)) {
      _move['right'] = true;
      _moveDir = "right";
    } else {
      _move['right'] = false;
    }



    // position updates
    if (_moveDir != null) {
      for (let _i = 0; _i < player.speed; _i++) {
        let _retval = checkMove(player.position, chunkIndex, _move);//_moveDir); ///// TBD: THIS NEEDS TO BE THE ARRAY!
        if (_retval['state']) { // true -- move
          player.position.x = _retval['pos']['dx'];
          player.position.y = _retval['pos']['dy'];

          if (_retval['speed']) { // walking through something that modifies your speed
            player.speed = _retval['speed'];
            player.speedCtr = 0;
          }

          // special check for non-sprite interactions
          let _rc = getRowCol(player.position.x, player.position.y);
          let _tile = getTileType(chunkIndex, _rc['row'], _rc['col']);
          let _town_tile = getTile(chunkIndex, _rc['row'], _rc['col']);
          if (_tile == TILES.TOWN) {
            // save players position before transitioning
            storeLastPosition(chunkIndex, player.position);

            chunkIndex = NUM_CHUNKS + gameMap[chunkIndex][_rc['row']][_rc['col']]['nextChunk'];
            let _new_pos = getSpritePosition((int)(TOWN_ROWS / 2), 1)
            player.position.x = _new_pos['dx'];
            player.position.y = _new_pos['dy'];

            activeNPCString = "Welcome to Farmhill!";
            activeNPCStringTimer = activeNPCStringTime;
          }

          // tbd: abstract these a bit!
          if ((_tile == TILES.SHIFT_SCREEN_LEFT) && (chunkIndex >= NUM_CHUNKS)) { // a town!
            chunkIndex = PRIOR_CHUNK;
            let _new_pos = getSpritePosition(PRIOR_ROW, PRIOR_COL);
            player.position.x = _new_pos['dx'];
            player.position.y = _new_pos['dy'];
            activeNPCString = "Back to chunk: " + chunkIndex;
            activeNPCStringTimer = activeNPCStringTime;
          } else {
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
      }
    }

    // increase velocity
    if (_move['down'] || _move['up'] || _move['left'] || _move['right']) {
      if (player.speedCtr < 10) {
        if (player.speedCtr < 5)
          player.speed = 1;
        else
          player.speed = 2;

        player.speedCtr++;
      }
    }
    if (!_move['down'] && !_move['up'] && !_move['left'] && !_move['right']) {
      player.speedCtr = 0;
      player.speed = 1;
    }

    // clamp camera and draw player 
    let _map_height = MAP_HEIGHT;
    let _map_width = MAP_WIDTH;
    if (chunkIndex >= NUM_CHUNKS) {
      _map_height = TOWN_ROWS * TILE_HEIGHT;
      _map_width = TOWN_COLS * TILE_WIDTH;
    }

    camera.position.x = clamp(player.position.x, CANVAS_WIDTH * 0.5, _map_width - CANVAS_WIDTH * 0.5);
    camera.position.y = clamp(player.position.y, CANVAS_HEIGHT * 0.5, _map_height - CANVAS_HEIGHT * 0.5);

    ui_x = camera.position.x - CANVAS_WIDTH / 2;
    ui_y = camera.position.y - CANVAS_HEIGHT / 2;

  } else {
    if (activeTile) { // show some info!
      // bg
      fill(color(0, 0, 0, 220));
      rect(player.position.x + 5, player.position.y - 55, 150, 50);
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
  text(startupMsg, 0, CANVAS_HEIGHT / 2, CANVAS_WIDTH);

  if (frameCount > 25) {
    INTRO_CTR -= 5;
    if (INTRO_CTR <= 0) {
      CURRENT_SCENE = SCENES.GAME;
      INTRO_SFX.setVolume(0, 5);
    }
  }
}