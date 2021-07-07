///globals
///helper functions

function getSpriteOffset(row, col, tileSize) {
  let dx = col * tileSize;
  let dy = row * tileSize;
  return { 'dx': dx, 'dy': dy };
}

setup.STATES = {
  GAME: 0,
  WIN: 1,
  GAMEOVER: 2,
  DIALOGUE: 3,
  LOST_SANITY: 4,
}

let _monsters = [
  {
    'name': 'Ancient',
    'img': 'Black Ancient.png'
  },
  {
    'name': 'Birdi',
    'img': 'Black Birdi.png'
  },
  {
    'name': 'Bot',
    'img': 'Black Bot.png'
  },
  {
    'name': 'Bug',
    'img': 'Black Bug.png'
  },
  {
    'name': 'Chomp Plant',
    'img': 'Black Chomp Plant.png'
  },
  {
    'name': 'Kreb',
    'img': 'Black Crab.png'
  },
  {
    'name': 'Dancer',
    'img': 'Black Dancer.png'
  },
  {
    'name': 'Demon Skele',
    'img': 'Black Demon Skele.png'
  },
  {
    'name': 'Demoness',
    'img': 'Black Demoness.png'
  },
  {
    'name': 'Dancer',
    'img': 'Black Doll Dancing.png'
  },
  {
    'name': 'Eyes',
    'img': 'Black Eyes.png'
  },
  {
    'name': 'Fighter',
    'img': 'Black Fighter.png'
  },
  {
    'name': 'Genie',
    'img': 'Black Genie.png'
  },
  {
    'name': 'Hand',
    'img': 'Black Hand.png'
  },
  {
    'name': 'Holler',
    'img': 'Black Holler.png'
  },
  {
    'name': 'Hulking',
    'img': 'Black Hulking.png'
  },
  {
    'name': 'Inquisition',
    'img': 'Black Inquisition.png'
  },
  {
    'name': 'Intimidator',
    'img': 'Black Intimidator.png'
  },
  {
    'name': 'Jelly',
    'img': 'Black Jelly.png'
  },
  {
    'name': 'Joy',
    'img': 'Black Joy.png'
  },
  {
    'name': 'Jump',
    'img': 'Black Jump.png'
  },
  {
    'name': 'Kablam',
    'img': 'Black Kablam.png'
  },
  {
    'name': 'Menace',
    'img': 'Black Menace.png'
  },
  {
    'name': 'Mini-Bot',
    'img': 'Black Mini-Bot.png'
  },
  {
    'name': 'Mouth',
    'img': 'Black Mouth.png'
  },
  {
    'name': 'One-Eye',
    'img': 'Black One-Eye.png'
  },
  {
    'name': 'Peeper',
    'img': 'Black Peeper.png'
  },
  {
    'name': 'Pixie',
    'img': 'Black Pixie.png'
  },
  {
    'name': 'Reaper',
    'img': 'Black Reaper.png'
  },
  {
    'name': 'Revel',
    'img': 'Black Revel.png'
  },
  {
    'name': 'Salesman',
    'img': 'Black Salesman.png'
  },
  {
    'name': 'Scare',
    'img': 'Black Scare.png'
  },
  {
    'name': 'Scratchy',
    'img': 'Black Scratchy.png'
  },
  {
    'name': 'Scream',
    'img': 'Black Scream.png'
  },
  {
    'name': 'Sea Crawler',
    'img': 'Black Sea Crawler.png'
  },
  {
    'name': 'Skele-heart',
    'img': 'Black Skele-heart.png'
  },
  {
    'name': 'Skull',
    'img': 'Black Skull.png'
  },
  {
    'name': 'Sleek',
    'img': 'Black Sleek.png'
  },
  {
    'name': 'Slime',
    'img': 'Black Slime.png'
  },
  {
    'name': 'Slither',
    'img': 'Black Slither.png'
  },
  {
    'name': 'Spikey',
    'img': 'Black Spikey.png'
  },
  {
    'name': 'Stalker',
    'img': 'Black Stalker.png'
  },
  {
    'name': 'Tortoola',
    'img': 'Black Tortoola.png'
  },
  {
    'name': 'Turtle Creeper',
    'img': 'Black Turtle Creeper.png'
  },
  {
    'name': 'Turtle-man',
    'img': 'Black Turtle-man.png'
  },
  {
    'name': 'Walker',
    'img': 'Black Walker.png'
  },
  {
    'name': 'Wasp-Man',
    'img': 'Black Wasp-Man.png'
  },
  {
    'name': 'Wiggles',
    'img': 'Black Wiggles.png'
  },
  {
    'name': 'Wolf',
    'img': 'Black Wolf.png'
  },
  {
    'name': 'Emergence',
    'img': 'Blank Emergence.png'
  }
]

let getRandomInteger = function (min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
window.getRandomInteger = getRandomInteger;

setup.prefabs = [
  'empty',
  'cavern1',
  'cavern2',
  'cavern3',
  'tight',
  'stream',
  'pool',
  'void',
  'fire',
];

class GameManager {
  constructor(rooms) {
    this.map = [];
    this.npcs = [];
    this.mapWidth = 10;
    this.mapHeight = 10;
    this.maxDepth = 5;
    this.noiseGen = new FastSimplexNoise({ frequency: 0.01, octaves: 8 });
    // this.noiseGen = new FastSimplexNoise({ frequency: 0.01, octaves: 4 });
    this.init();

    this.fightActive = false;
    this.activeMonster = null;

    this.friends = this.generateFriends();
    this.totalFriends = this.friends.length;
    this.friendsRescued = 0;
    this.flashlightFriend = getRandomInteger(0, this.totalFriends);

    this.player = new Character("Erik", 1, 10, 1, 0, 0, 0);
    this.player.isPlayer = true;

    this.eventCharacters = {}
    let _depth = 0;
    for (let d = 0; d < this.maxDepth; d++) {
      for (let row = 0; row < this.mapHeight; row++)
        for (let col = 0; col < this.mapWidth; col++)
          this.eventCharacters[`${d}:${row}:${col}`] = null;
    }
    // generate monsters
    this.eventCharacters = this.generateCharacters();
    console.log(this.eventCharacters);

    this.placeCharacter(this.player);

    // carve out if necessary (post monsters/characters generation)
    // this.carveCaverns();

    this.flashlight = {
      'status': 'off',
      'battery': 100
    };

    this.spriteSheet = new Image();
    this.spriteSheet.src = "./assets/1bitpack_kenney_1.1/Tilesheet/colored_transparent_packed.png"
    this.tileSize = 16;
    // this.spriteSheet.src = "./assets/kenny-microroguelike/colored_tilemap_packed.png";
    // spriteSheet.onload = stateHandler;// need to make sure this is loaded!


    // testgen
    // this.worker = new Worker("scripts/testgen-worker.js");
    // this.worker.iterations = 0;
    // this.worker.onmessage = e => {
    //   const message = e.data;
    //   console.log(`[From worker]: ${message}`);

    //   let msg = "SERVER";
    //   this.worker.iterations++;
    //   if (this.worker.iterations > 3) {
    //     msg = "CLOSE";
    //   }

    //   const reply = setTimeout(() => this.worker.postMessage(msg), 3000);
    // };
    // this.worker.postMessage("=== main testing loop begin ===");

  }
  init() {
    for (let d = 0; d < this.maxDepth; d++) { // depth
      this.map[d] = [];

      if (d < this.maxDepth - 1) {
        // if (d <= 1) { // first floor

        // fill with walls
        for (let r = 0; r < this.mapHeight; r++) {
          this.map[d][r] = [];
          for (let c = 0; c < this.mapWidth; c++) {
            this.map[d][r][c] = { 'passage': 'wall', 'visited': false, 'sanity': 0 };
          }
        }

        // // drunkard's walk -- not working, just random now
        // TBD: need to ensure that there is a valid path!
        let num_cells = Math.ceil(0.5 * this.mapWidth * this.mapHeight);
        let start_row = 0;//Math.floor(this.mapHeight/2);//getRandomInteger(1, this.mapHeight - 1);
        let start_col = 0;//Math.floor(this.mapWidth/2);//getRandomInteger(1, this.mapWidth - 1);
        this.map[d][start_row][start_col] = { 'passage': setup.prefabs[getRandomInteger(1, 4)], 'visited': false, 'sanity': -1 };
        let total = 1;

        while (total < num_cells) {
          start_row = getRandomInteger(1, this.mapHeight - 1);
          start_col = getRandomInteger(1, this.mapWidth - 1);
          if (this.map[d][start_row][start_col].passage == "wall") {
            this.map[d][start_row][start_col] = { 'passage': setup.prefabs[getRandomInteger(1, 4)], 'visited': false, 'sanity': -1 };
            total++;
          }
        }


        // while (total <= num_cells) {
        //   let dirs = [
        //     [-1,-1],
        //     [-1,0],
        //     [-1,1],
        //     [0,-1],
        //     [0,0],
        //     [0,1],
        //     [1,-1],
        //     [1,0],
        //     [1,1],
        //   ];

        //   let indx = getRandomInteger(0, dirs.length);
        //   let _r = start_row + dirs[indx][0];
        //   let _c = start_col + dirs[indx][1];

        //   if (_r >= 0 && _c >= 0 && _r <= this.mapHeight-1 && _c <= this.mapWidth-1) {
        //     // if (this.map[d][_r][_c].passage == "wall") {
        //      this.map[d][_r][_c] = { 'passage': setup.prefabs[getRandomInteger(1, 4)], 'visited': false, 'sanity': -1 };
        //      total++;
        //     // }
        //   } 


        // let validPassages = this.getPassages({ 'row': start_row, 'col': start_col, 'depth': d })
        // let indx = getRandomInteger(0, validPassages.length);
        // if (validPassages[indx].valid && validPassages[indx].header != "wait") {
        //   start_row = validPassages[indx].row;
        //   start_col = validPassages[indx].col;
        //   this.map[d][start_row][start_col] = { 'passage': setup.prefabs[getRandomInteger(1, 4)], 'visited': false, 'sanity': -1 };
        //   total++;
        // }
        // }

        for (let r = 0; r < this.mapHeight; r++) {
          for (let c = 0; c < this.mapWidth; c++) {
            if (this.map[d][r][c].passage != 'wall') {
              let randomOffset = getRandomInteger(0, 100000);
              let _noise = this.noiseGen.get2DNoise(c + randomOffset, r + randomOffset);

              let _room = setup.prefabs[0];
              let _sanity = -1;
              if (_noise < 0.0) { // empty
                _room = setup.prefabs[0];
              } else if (_noise < 0.4) { // cavern
                _room = setup.prefabs[getRandomInteger(1, 4)];
              } else if (_noise < 0.5) {
                _room = setup.prefabs[4]; // tight squeeze
                _sanity = -5;
              } else if (_noise < 0.6) { // stream
                _room = setup.prefabs[5];
                _sanity = 5;
              } else if (_noise < 0.7) { // pool 
                _room = setup.prefabs[6];
                _sanity = 5;
              } else if (_noise < 0.8) { // void
                _room = setup.prefabs[7];
                _sanity = -10;
              } else { // empty
                _room = setup.prefabs[0];
              }

              this.map[d][r][c] = { 'passage': _room, 'visited': false, 'sanity': _sanity };
            }
          }
        }




        /*
      } else { // other floors

        for (let r = 0; r < this.mapHeight; r++) {
          this.map[d][r] = [];
          for (let c = 0; c < this.mapWidth; c++) {
            if (r == 0 && c == 0 && d == 0) // always start at 0,0
              this.map[d][r][c] = { 'passage': 'start', 'visited': true, 'sanity': 10 };
            else {
              let randomOffset = getRandomInteger(0, 100000);
              let _noise = this.noiseGen.get2DNoise(c + randomOffset, r + randomOffset);

              let _room = setup.prefabs[0];
              let _sanity = -1;
              if (_noise < 0.0) { // empty
                _room = setup.prefabs[0];
              } else if (_noise < 0.4) { // cavern
                _room = setup.prefabs[getRandomInteger(1, 4)];
              } else if (_noise < 0.5) {
                _room = setup.prefabs[4]; // tight squeeze
                _sanity = -5;
              } else if (_noise < 0.6) { // stream
                _room = setup.prefabs[5];
                _sanity = 5;
              } else if (_noise < 0.7) { // pool 
                _room = setup.prefabs[6];
                _sanity = 5;
              } else if (_noise < 0.8) { // void
                _room = setup.prefabs[7];
                _sanity = -10;
              } else { // empty
                _room = setup.prefabs[0];
              }

              this.map[d][r][c] = { 'passage': _room, 'visited': false, 'sanity': _sanity };
            }
          }
        }
      }*/
      } else { // last level
        for (let r = 0; r < this.mapHeight; r++) {
          this.map[d][r] = [];
          let _room = setup.prefabs[0];
          for (let c = 0; c < this.mapWidth; c++) {
            _room = setup.prefabs[8];
            this.map[d][r][c] = { 'passage': _room, 'visited': false, 'sanity': 0 };//-10 };
          }
        }
      }

      let _downrow = null;
      let _downcol = null;
      let _uprow = null;
      let _upcol = null;

      if (d == 0) { // only down

        do {
          _downrow = getRandomInteger(3, this.mapHeight - 1);
          _downcol = getRandomInteger(3, this.mapWidth - 1);
        } while ((_downrow == _uprow && _downcol == _upcol) || (this.map[d][_downrow][_downcol].passage == 'wall'));

      } else if (d == this.maxDepth - 1) { // only up

        do {
          _uprow = getRandomInteger(3, this.mapHeight - 1);
          _upcol = getRandomInteger(3, this.mapWidth - 1);
        } while ((_downrow == _uprow && _downcol == _upcol) || (this.map[d][_uprow][_upcol].passage == 'wall'));

      } else { // both

        do {
          _downrow = getRandomInteger(3, this.mapHeight - 1);
          _downcol = getRandomInteger(3, this.mapWidth - 1);
        } while ((_downrow == _uprow && _downcol == _upcol) || (this.map[d][_downrow][_downcol].passage == 'wall'));

        do {
          _uprow = getRandomInteger(3, this.mapHeight - 1);
          _upcol = getRandomInteger(3, this.mapWidth - 1);
        } while ((_downrow == _uprow && _downcol == _upcol) || (this.map[d][_uprow][_upcol].passage == 'wall'));

      }

      if (_downrow != null && _downcol != null)
        this.map[d][_downrow][_downcol] = { 'passage': 'down1', 'visited': false, 'sanity': 5, 'stairsdown': true };
      if (_uprow != null && _upcol != null)
        this.map[d][_uprow][_upcol] = { 'passage': 'up1', 'visited': false, 'sanity': 5, 'stairsup': true };

    }
    // console.log(this.map);
  }

  // only carve out walls, no need to carve other things
  isCarveable(d, r, c) {
    if (r >= 0 && r < this.mapHeight && c >= 0 && c < this.mapWidth) {
      if (this.map[d][r][c].passage == 'wall')
        return true;
      else
        return false;
    }
    return false;
  }

  placeCharacter(p) {
    do {
      p.row = getRandomInteger(0, this.mapHeight);
      p.col = getRandomInteger(0, this.mapWidth);
    } while (this.map[p.depth][p.row][p.col].passage == "wall");
  }

  carveCaverns() {
    let d = 0; // looperize this later, depending on how we do things
    let thingsToCarve = []; // r:val, c:val

    // make space around:
    // stairs, enemies
    for (let r = 0; r < this.mapHeight; r++) {
      for (let c = 0; c < this.mapWidth; c++) {
        if (this.map[d][r][c].passage == "up1" || this.map[d][r][c].passage == "down1" || this.hasCharacter(r, c, d))
          thingsToCarve.push({ 'r': r, 'c': c });
      }
    }
    // items

    // player
    thingsToCarve.push({ 'r': this.player.row, 'c': this.player.col });

    for (let _i = 0; _i < thingsToCarve.length; _i++) {
      let _r = thingsToCarve[_i].r;
      let _c = thingsToCarve[_i].c;

      // .
      if (this.isCarveable(d, _r, _c))
        this.map[d][_r][_c] = { 'passage': setup.prefabs[0], 'visited': false, 'sanity': 0 };
      // n
      if (this.isCarveable(d, _r - 1, _c))
        this.map[d][_r - 1][_c] = { 'passage': setup.prefabs[0], 'visited': false, 'sanity': 0 };
      // ne
      if (this.isCarveable(d, _r - 1, _c + 1))
        this.map[d][_r - 1][_c + 1] = { 'passage': setup.prefabs[0], 'visited': false, 'sanity': 0 };
      // e
      if (this.isCarveable(d, _r, _c + 1))
        this.map[d][_r][_c + 1] = { 'passage': setup.prefabs[0], 'visited': false, 'sanity': 0 };
      // se
      if (this.isCarveable(d, _r + 1, _c + 1))
        this.map[d][_r + 1][_c + 1] = { 'passage': setup.prefabs[0], 'visited': false, 'sanity': 0 };
      // s
      if (this.isCarveable(d, _r + 1, _c))
        this.map[d][_r + 1][_c] = { 'passage': setup.prefabs[0], 'visited': false, 'sanity': 0 };
      // sw
      if (this.isCarveable(d, _r + 1, _c - 1))
        this.map[d][_r + 1][_c - 1] = { 'passage': setup.prefabs[0], 'visited': false, 'sanity': 0 };
      // w
      if (this.isCarveable(d, _r, _c - 1))
        this.map[d][_r][_c - 1] = { 'passage': setup.prefabs[0], 'visited': false, 'sanity': 0 };
      // nw
      if (this.isCarveable(d, _r - 1, _c - 1))
        this.map[d][_r - 1][_c - 1] = { 'passage': setup.prefabs[0], 'visited': false, 'sanity': 0 };
    }

    // carve tunnels

  }

  // monster/NPC AI
  updateCharacters(depth) {
    let _updates = {};

    // depth is the first part of the key
    Object.entries(this.eventCharacters).forEach(([key, value]) => {
      if (key.substring(0, 2) === "0:") {
        if (Math.random() > 0.9) {
          // figure out new position --- TBD
          _updates[key] = key; // key -> old, val -> new
        }
      }
    });
  }


  generateCharacters() {
    let _chars = {};

    // boss
    _chars[`${this.maxDepth - 1}:${this.mapHeight - 1}:${this.mapWidth - 1}`] = {
      'type': 'monster',
      'monster': _monsters[getRandomInteger(0, _monsters.length)],
      'boss': true
    };

    // randomly generate the rest of the monsters
    for (let d = 0; d < this.maxDepth; d++) {
      for (let _i = d + 1; _i > 0; _i--) {
        let _row, _col, _key;
        do {
          _row = getRandomInteger(1, this.mapHeight);
          _col = getRandomInteger(1, this.mapWidth);
          _key = `${d}:${_row}:${_col}`;
        } while (_key in _chars || this.map[d][_row][_col].passage == "wall");
        _chars[_key] = {
          'type': 'monster',
          'monster': _monsters[getRandomInteger(0, _monsters.length)],
        };
      }
    }

    return _chars;
  }

  hasCharacter(row, col, depth) {
    let _key = `${depth}:${row}:${col}`;
    if (this.eventCharacters[_key] != null) {
      return true;
    }
    return false;
  }
  getCharacter(row, col, depth) {
    return this.eventCharacters[`${depth}:${row}:${col}`];
  }
  // createCharacter(row, col, depth, type) {
  //   if (type == "monster") {
  //     this.eventCharacters[`${depth}:${row}:${col}`] = { 'type': type, 'monster': _monsters[getRandomInteger(0, _monsters.length)] };

  //   } else
  //     this.eventCharacters[`${depth}:${row}:${col}`] = { 'type': type };
  //   return this.eventCharacters[`${depth}:${row}:${col}`];
  // }
  destroyCharacter(row, col, depth) {
    this.eventCharacters[`${depth}:${row}:${col}`] = null;
  }

  // return what the nearby rooms have
  getThingsNearby(player) {

  }

  // return a random event
  randomEvent() {
    if (this.player.row == 0 && this.player.col == 0) // protect the 'starting location'
      return { 'event': null, 'return': false };
    else if (Math.random() > 0.25) {
      let _r = Math.random();

      // spores
      // npc
      // monster
      // item
      if (_r < 0.25)
        return { 'event': 'spores', 'return': true };
      else if (_r < 0.5)
        return { 'event': 'npc', 'return': true };
      // else if (_r < 0.75)
      //   return { 'event': 'monster', 'return': true };
      else
        return { 'event': 'tbd', 'return': true };
    } else
      return { 'event': null, 'return': false };
  }

  vizMapCanvas(depth) {
    let _div = document.getElementById("map-canvas-holder");
    let canvas = document.createElement('canvas');

    let buff = 0;//2;

    let ctx = canvas.getContext("2d");
    canvas.width = 10 * this.tileSize * 2 + (buff * 9);
    canvas.height = 10 * this.tileSize * 2 + (buff * 9);
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = "rgba(71,45,60,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ctx.fillStyle = "red";
    // ctx.fillRect(10, 10, 80, 80);


    let x_pos = 0;
    let y_pos = 0;
    for (let r = 0; r < this.mapHeight; r++) {
      for (let c = 0; c < this.mapWidth; c++) {
        // ctx.fillStyle = "rgba(255,0,0,1.0)";
        // ctx.fillRect(x_pos,y_pos,tileSize,tileSize);
        let offset;

        if (r == this.player.row && c == this.player.col)
          offset = getSpriteOffset(14, 35, this.tileSize);
        else {
          if (this.hasCharacter(r, c, depth)) { // enemy here
            offset = getSpriteOffset(5, 24, this.tileSize);
            // _txt = "+";
          } else if (this.getPassage(r, c, depth) == "start") { // starting point
            offset = getSpriteOffset(10, 14, this.tileSize);
          } else if (this.getPassage(r, c, depth) == setup.prefabs[0]) { // empty
            offset = getSpriteOffset(0, 1, this.tileSize);
          } else if ([setup.prefabs[1], setup.prefabs[2], setup.prefabs[3]].indexOf(this.getPassage(r, c, depth)) >= 0) { // cavern
            offset = getSpriteOffset(0, getRandomInteger(2, 5), this.tileSize);
          } else if (this.getPassage(r, c, depth) == setup.prefabs[4]) { // tight
            offset = getSpriteOffset(2, 6, this.tileSize);
          } else if (this.getPassage(r, c, depth) == setup.prefabs[5]) { // stream
            offset = getSpriteOffset(4, 8, this.tileSize);
          } else if (this.getPassage(r, c, depth) == setup.prefabs[6]) { // pool
            offset = getSpriteOffset(5, 8, this.tileSize);
          } else if (this.getPassage(r, c, depth) == setup.prefabs[8]) { // fire
            offset = getSpriteOffset(13, 6, this.tileSize);
          } else if (this.getPassage(r, c, depth) == 'wall') {
            offset = getSpriteOffset(2, 5, this.tileSize);
          } else if (this.getPassage(r, c, depth) == 'down1') {
            offset = getSpriteOffset(6, 3, this.tileSize);
          } else if (this.getPassage(r, c, depth) == 'up1') {
            offset = getSpriteOffset(6, 2, this.tileSize);
          } else { // void
            offset = getSpriteOffset(21, 39, this.tileSize);
          }
        }

        ctx.drawImage(
          this.spriteSheet,
          offset['dx'],
          offset['dy'],
          this.tileSize,
          this.tileSize,
          Math.round(x_pos),
          Math.round(y_pos),
          this.tileSize * 2,
          this.tileSize * 2
        );

        x_pos += this.tileSize * 2 + buff;
      }
      y_pos += this.tileSize * 2 + buff;
      x_pos = 0;
    }
    // return canvas;
    // ret += "</canvas>";
    _div.appendChild(canvas);
  }

  vizMap(depth) {
    // let ret = "<table>";
    let ret = "<div class='map-container'>"
    for (let r = 0; r < this.mapHeight; r++) {
      // ret += "<tr>";
      for (let c = 0; c < this.mapWidth; c++) {
        let _cls;
        let _txt = ".";
        if (this.player.row == r && this.player.col == c)
          _cls = 'active';
        // else if (this.getPassageVisited(r, c, depth))
        //   _cls = 'visited';
        else {
          if (this.getPassageVisited(r, c, depth))
            _cls = 'visited';
          else
            _cls = '';

          // tbd - temp viz
          if (this.hasCharacter(r, c, depth)) {
            _cls = ' monster';
            // _txt = "+";
          } else if (this.getPassage(r, c, depth) == setup.prefabs[0]) {
            _cls += ' empty';
            // else if (this.getPassage(r,c) == setup.prefabs[1])
          } else if ([setup.prefabs[1], setup.prefabs[2], setup.prefabs[3]].indexOf(this.getPassage(r, c, depth)) >= 0) {
            _cls += ' cavern';
            _txt = "o";
          } else if (this.getPassage(r, c, depth) == setup.prefabs[4]) {
            _cls += ' tight';
            _txt = "|";
          } else if (this.getPassage(r, c, depth) == setup.prefabs[5]) {
            _cls += ' stream';
            _txt = "~";
          } else if (this.getPassage(r, c, depth) == setup.prefabs[6]) {
            _cls += ' pool';
            _txt = "p";
          } else if (this.getPassage(r, c, depth) == 'down1') {
            _cls += ' down';
            _txt = ">";
          } else if (this.getPassage(r, c, depth) == 'up1') {
            _cls += ' up';
            _txt = "<";
          } else {
            _cls += ' void';
            _txt = "*";
          }
        }

        ret += "<div class='map-cell " + _cls + "'></div>";

        // ret += "<td class='" + _cls + "'></td>";
      }
      // ret += "</tr>";
    }
    // ret += "</table>";
    ret += "</div>";

    return ret;
  }

  setPassageVisited(row, col, depth) {
    this.map[depth][row][col].visited = true;
  }
  getPassageVisited(row, col, depth) {
    return this.map[depth][row][col].visited;
  }
  getPassage(row, col, depth) {
    return this.map[depth][row][col].passage;
  }

  getMapSanity(row, col, depth) {
    return this.map[depth][row][col].sanity;
  }

  getFriendsHere(row, col, depth) {
    let _friends = [];
    // debugging
    // if (row == 1 && col == 1 && this.friendsRescued == 0) {
    //   _friends.push(this.friends[0]);
    //   _friends.push(this.friends[1]);
    //   _friends.push(this.friends[2]);
    // }
    for (let i = 0; i < this.friends.length; i++) {
      if (this.friends[i].row == row && this.friends[i].col == col && this.friends[i].depth == depth)
        _friends.push(this.friends[i]);
    }
    return _friends;
  }

  rescueFriend(friend) {
    for (let i = this.friends.length - 1; i >= 0; i--) {
      if (this.friends[i] == friend) {
        this.friends.splice(i, 1);
        this.friendsRescued++;
      }
    }
  }

  // get valid passages for movement
  getPassages(player) {
    let _passages = [];

    // north
    let _n = { header: "north", text: "n" };
    if (player.row > 0) {
      _n.row = player.row - 1;
      _n.col = player.col;
      _n.valid = true;
    } else
      _n.valid = false;
    _passages.push(_n);

    // northeast
    let _ne = { header: "northeast", text: "ne" };
    if (player.row > 0 && player.col < this.mapWidth - 1) {
      _ne.row = player.row - 1;
      _ne.col = player.col + 1;
      _ne.valid = true;
    } else
      _ne.valid = false;
    _passages.push(_ne);

    // east
    let _e = { header: "east", text: "e" };
    if (player.col < this.mapWidth - 1) {
      _e.row = player.row;
      _e.col = player.col + 1;
      _e.valid = true;
    } else
      _e.valid = false;
    _passages.push(_e);

    // southeast
    let _se = { header: "southeast", text: "se" };
    if (player.row < this.mapHeight - 1 && player.col < this.mapWidth - 1) {
      _se.row = player.row + 1;
      _se.col = player.col + 1;
      _se.valid = true;
    } else
      _se.valid = false;
    _passages.push(_se);

    // south
    let _s = { header: "south", text: "s" };
    if (player.row < this.mapHeight - 1) {
      _s.row = player.row + 1;
      _s.col = player.col;
      _s.valid = true;
    } else
      _s.valid = false;
    _passages.push(_s);

    // southwest
    let _sw = { header: "southwest", text: "sw" };
    if (player.row < this.mapHeight - 1 && player.col > 0) {
      _sw.row = player.row + 1;
      _sw.col = player.col - 1;
      _sw.valid = true;
    } else
      _sw.valid = false;
    _passages.push(_sw);

    // west
    let _w = { header: "west", text: "w" };
    if (player.col > 0) {
      _w.row = player.row;
      _w.col = player.col - 1;
      _w.valid = true;
    } else
      _w.valid = false;
    _passages.push(_w);

    // northwest
    let _nw = { header: "northwest", text: "nw" };
    if (player.row > 0 && player.col > 0) {
      _nw.row = player.row - 1;
      _nw.col = player.col - 1;
      _nw.valid = true;
    } else
      _nw.valid = false;
    _passages.push(_nw);

    // wait
    let _wait = { header: "wait", text: "." };
    _wait.row = player.row;
    _wait.col = player.col;
    _wait.depth = player.depth;
    _wait.valid = true;

    // override for stairs
    if (this.map[player.depth][player.row][player.col].stairsup) {
      _wait.text = "<";
      _wait.stairsup = true; // duplicate for easier check in TW
      _wait.depth = player.depth - 1;

      // set starting location
      for (let _r = 0; _r < this.mapHeight - 1; _r++) {
        for (let _c = 0; _c < this.mapWidth - 1; _c++) {
          if (this.map[player.depth - 1][_r][_c].stairsdown) {
            _wait.startRow = _r;
            _wait.startCol = _c;
            break;
          }
        }
      }
    } else if (this.map[player.depth][player.row][player.col].stairsdown) {
      _wait.text = ">";
      _wait.stairsdown = true; // duplicate for easier check in TW
      _wait.depth = player.depth + 1;

      // set starting location
      for (let _r = 0; _r < this.mapHeight - 1; _r++) {
        for (let _c = 0; _c < this.mapWidth - 1; _c++) {
          if (this.map[player.depth + 1][_r][_c].stairsup) {
            _wait.startRow = _r;
            _wait.startCol = _c;
            break;
          }
        }
      }
    }

    _passages.push(_wait);

    // set depths to player's
    for (let i = 0; i < _passages.length; i++) {
      if (!_passages[i].stairsdown && !_passages[i].stairsup)
        _passages[i]['depth'] = player.depth;

      // check for validity (i.e., collisions)
      if (_passages[i].valid)
        if (this.map[_passages[i].depth][_passages[i].row][_passages[i].col].passage == "wall")
          _passages[i].valid = false;
    }


    return _passages;
  }

  generateFriends() {
    let _friendLocations = {};
    let _friends = [];

    let _names = this.generateNames();

    for (let i = 0; i < 4; i++) {

      let _row, _col, _indx;
      do {
        _row = getRandomInteger(2, this.map.length);
        _col = getRandomInteger(2, this.map[_row].length);
        _indx = `${_row}:${_col}`;
      } while (_indx.indexOf(_friendLocations) >= 0);
      _friendLocations[_indx] = i;

      // let _friend = new Character(_name, -1, -1, -1, _row, _col);
      let _friend = new Character(_names[i], -1, -1, -1, 2, 2, i);
      _friends.push(_friend);
    }

    return _friends;
  }

  generateNames() {
    let ret_names = [];
    // DariusK's corpora, just copy/pasted to avoid loading and waiting for a promise
    // Probably the worst way to do this but we'll fix it in post /shrug
    let _names = {
      "description": "First names of men and women, pulled from the US Census for the 2000s.",
      "firstNames": [
        "Aaliyah",
        "Aaron",
        "Abby",
        "Abigail",
        "Abraham",
        "Adam",
        "Addison",
        "Adrian",
        "Adriana",
        "Adrianna",
        "Aidan",
        "Aiden",
        "Alan",
        "Alana",
        "Alejandro",
        "Alex",
        "Alexa",
        "Alexander",
        "Alexandra",
        "Alexandria",
        "Alexia",
        "Alexis",
        "Alicia",
        "Allison",
        "Alondra",
        "Alyssa",
        "Amanda",
        "Amber",
        "Amelia",
        "Amy",
        "Ana",
        "Andrea",
        "Andres",
        "Andrew",
        "Angel",
        "Angela",
        "Angelica",
        "Angelina",
        "Anna",
        "Anthony",
        "Antonio",
        "Ariana",
        "Arianna",
        "Ashley",
        "Ashlyn",
        "Ashton",
        "Aubrey",
        "Audrey",
        "Austin",
        "Autumn",
        "Ava",
        "Avery",
        "Ayden",
        "Bailey",
        "Benjamin",
        "Bianca",
        "Blake",
        "Braden",
        "Bradley",
        "Brady",
        "Brandon",
        "Brayden",
        "Breanna",
        "Brendan",
        "Brian",
        "Briana",
        "Brianna",
        "Brittany",
        "Brody",
        "Brooke",
        "Brooklyn",
        "Bryan",
        "Bryce",
        "Bryson",
        "Caden",
        "Caitlin",
        "Caitlyn",
        "Caleb",
        "Cameron",
        "Camila",
        "Carlos",
        "Caroline",
        "Carson",
        "Carter",
        "Cassandra",
        "Cassidy",
        "Catherine",
        "Cesar",
        "Charles",
        "Charlotte",
        "Chase",
        "Chelsea",
        "Cheyenne",
        "Chloe",
        "Christian",
        "Christina",
        "Christopher",
        "Claire",
        "Cody",
        "Colby",
        "Cole",
        "Colin",
        "Collin",
        "Colton",
        "Conner",
        "Connor",
        "Cooper",
        "Courtney",
        "Cristian",
        "Crystal",
        "Daisy",
        "Dakota",
        "Dalton",
        "Damian",
        "Daniel",
        "Daniela",
        "Danielle",
        "David",
        "Delaney",
        "Derek",
        "Destiny",
        "Devin",
        "Devon",
        "Diana",
        "Diego",
        "Dominic",
        "Donovan",
        "Dylan",
        "Edgar",
        "Eduardo",
        "Edward",
        "Edwin",
        "Eli",
        "Elias",
        "Elijah",
        "Elizabeth",
        "Ella",
        "Ellie",
        "Emily",
        "Emma",
        "Emmanuel",
        "Eric",
        "Erica",
        "Erick",
        "Erik",
        "Erin",
        "Ethan",
        "Eva",
        "Evan",
        "Evelyn",
        "Faith",
        "Fernando",
        "Francisco",
        "Gabriel",
        "Gabriela",
        "Gabriella",
        "Gabrielle",
        "Gage",
        "Garrett",
        "Gavin",
        "Genesis",
        "George",
        "Gianna",
        "Giovanni",
        "Giselle",
        "Grace",
        "Gracie",
        "Grant",
        "Gregory",
        "Hailey",
        "Haley",
        "Hannah",
        "Hayden",
        "Hector",
        "Henry",
        "Hope",
        "Hunter",
        "Ian",
        "Isaac",
        "Isabel",
        "Isabella",
        "Isabelle",
        "Isaiah",
        "Ivan",
        "Jack",
        "Jackson",
        "Jacob",
        "Jacqueline",
        "Jada",
        "Jade",
        "Jaden",
        "Jake",
        "Jalen",
        "James",
        "Jared",
        "Jasmin",
        "Jasmine",
        "Jason",
        "Javier",
        "Jayden",
        "Jayla",
        "Jazmin",
        "Jeffrey",
        "Jenna",
        "Jennifer",
        "Jeremiah",
        "Jeremy",
        "Jesse",
        "Jessica",
        "Jesus",
        "Jillian",
        "Jocelyn",
        "Joel",
        "John",
        "Johnathan",
        "Jonah",
        "Jonathan",
        "Jordan",
        "Jordyn",
        "Jorge",
        "Jose",
        "Joseph",
        "Joshua",
        "Josiah",
        "Juan",
        "Julia",
        "Julian",
        "Juliana",
        "Justin",
        "Kaden",
        "Kaitlyn",
        "Kaleb",
        "Karen",
        "Karina",
        "Kate",
        "Katelyn",
        "Katherine",
        "Kathryn",
        "Katie",
        "Kayla",
        "Kaylee",
        "Kelly",
        "Kelsey",
        "Kendall",
        "Kennedy",
        "Kenneth",
        "Kevin",
        "Kiara",
        "Kimberly",
        "Kyle",
        "Kylee",
        "Kylie",
        "Landon",
        "Laura",
        "Lauren",
        "Layla",
        "Leah",
        "Leonardo",
        "Leslie",
        "Levi",
        "Liam",
        "Liliana",
        "Lillian",
        "Lilly",
        "Lily",
        "Lindsey",
        "Logan",
        "Lucas",
        "Lucy",
        "Luis",
        "Luke",
        "Lydia",
        "Mackenzie",
        "Madeline",
        "Madelyn",
        "Madison",
        "Makayla",
        "Makenzie",
        "Malachi",
        "Manuel",
        "Marco",
        "Marcus",
        "Margaret",
        "Maria",
        "Mariah",
        "Mario",
        "Marissa",
        "Mark",
        "Martin",
        "Mary",
        "Mason",
        "Matthew",
        "Max",
        "Maxwell",
        "Maya",
        "Mckenzie",
        "Megan",
        "Melanie",
        "Melissa",
        "Mia",
        "Micah",
        "Michael",
        "Michelle",
        "Miguel",
        "Mikayla",
        "Miranda",
        "Molly",
        "Morgan",
        "Mya",
        "Naomi",
        "Natalia",
        "Natalie",
        "Nathan",
        "Nathaniel",
        "Nevaeh",
        "Nicholas",
        "Nicolas",
        "Nicole",
        "Noah",
        "Nolan",
        "Oliver",
        "Olivia",
        "Omar",
        "Oscar",
        "Owen",
        "Paige",
        "Parker",
        "Patrick",
        "Paul",
        "Payton",
        "Peter",
        "Peyton",
        "Preston",
        "Rachel",
        "Raymond",
        "Reagan",
        "Rebecca",
        "Ricardo",
        "Richard",
        "Riley",
        "Robert",
        "Ruby",
        "Ryan",
        "Rylee",
        "Sabrina",
        "Sadie",
        "Samantha",
        "Samuel",
        "Sara",
        "Sarah",
        "Savannah",
        "Sean",
        "Sebastian",
        "Serenity",
        "Sergio",
        "Seth",
        "Shane",
        "Shawn",
        "Shelby",
        "Sierra",
        "Skylar",
        "Sofia",
        "Sophia",
        "Sophie",
        "Spencer",
        "Stephanie",
        "Stephen",
        "Steven",
        "Summer",
        "Sydney",
        "Tanner",
        "Taylor",
        "Thomas",
        "Tiffany",
        "Timothy",
        "Travis",
        "Trenton",
        "Trevor",
        "Trinity",
        "Tristan",
        "Tyler",
        "Valeria",
        "Valerie",
        "Vanessa",
        "Veronica",
        "Victor",
        "Victoria",
        "Vincent",
        "Wesley",
        "William",
        "Wyatt",
        "Xavier",
        "Zachary",
        "Zoe",
        "Zoey"
      ]
    };

    // grab unique names
    for (let i = 0; i < 4; i++) {
      let _n;

      do {
        _n = _names.firstNames[getRandomInteger(0, _names.firstNames.length)];
      } while (ret_names.includes(_n));
      ret_names.push(_n)
    }

    return ret_names;
  }
};
window.GameManager = GameManager;

//player sprite
//let offset = getSpriteOffset(14, 35);
//imgBuffer.image(spriteSheet, 40, 40, TILE_WIDTH, TILE_HEIGHT, offset['dx'], offset['dy'], TILE_WIDTH, TILE_HEIGHT);
class Character {
  constructor(name, level, hp, ac, row, col, depth) {
    this.name = name;
    this.inventory = {};
    this.level = level;
    this.hp = hp;
    this.max_hp = hp;
    this.ac = ac;
    this.row = row;
    this.col = col;
    this.sanity = 100;
    this.description = "I am a description";
    this.age = 14;
    this.depth = depth;
  }

  // pass negative normally to decrement
  updateSanity(amt) {
    this.sanity += amt;
    if (this.sanity <= 0) {
      this.sanity = 0;
      return false;
    }
    return true;
  }

  getSanity() {
    return this.sanity;
  }

  getHP() {
    let cls = "red";
    if (this.isPlayer) // || this.friendly?
      cls = "green";
    return "<font class='" + cls + "'>" + this.hp + "/" + this.max_hp + "</font>";
  }

  hit(dmg) {
    let hit_val = window.getRandomInteger(0, dmg + 1);
    this.hp -= hit_val;
    if (this.hp < 0)
      this.hp = 0;

    return hit_val;
  }

  incLevel() {
    this.level++;
    return this.level;
  }
};
window.Character = Character;
// module.exports = Character;
