///globals
///helper functions


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
    'name': 'Scream.png',
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
];

class GameManager {
  constructor(rooms) {
    console.log(rooms);
    this.map = [];
    this.npcs = [];
    this.mapWidth = 10;
    this.mapHeight = 10;
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

    this.eventCharacters = {}; // don't generate until random event triggers
    let _depth = 0;
    for (let row = 0; row < this.mapHeight; row++)
      for (let col = 0; col < this.mapWidth; col++)
        this.eventCharacters[`${_depth}:${row}:${col}`] = null;

    this.flashlight = {
      'status': 'off',
      'battery': 100
    };
  }
  init() {
    for (let d = 0; d < 5; d++) { // depth
      this.map[d] = [];

      for (let r = 0; r < this.mapHeight; r++) {
        this.map[d][r] = [];
        for (let c = 0; c < this.mapWidth; c++) {
          if (r == 0 && c == 0) // always start at 0,0
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

      let _downrow = null;
      let _downcol = null;
      let _uprow = null;
      let _upcol = null;

      if (d == 0) { // only down

        do {
          _downrow = getRandomInteger(3, this.mapHeight-1);
          _downcol = getRandomInteger(3, this.mapWidth-1);
        } while (_downrow == _uprow && _downcol == _upcol);

      } else if (d == 4) { // only up

        do {
          _uprow = getRandomInteger(3, this.mapHeight-1);
          _upcol = getRandomInteger(3, this.mapWidth-1);
        } while (_downrow == _uprow && _downcol == _upcol);

      } else { // both

        do {
          _downrow = getRandomInteger(3, this.mapHeight-1);
          _downcol = getRandomInteger(3, this.mapWidth-1);
        } while (_downrow == _uprow && _downcol == _upcol);

        do {
          _uprow = getRandomInteger(3, this.mapHeight-1);
          _upcol = getRandomInteger(3, this.mapWidth-1);
        } while (_downrow == _uprow && _downcol == _upcol);

      }

      if (_downrow != null && _downcol != null)
        this.map[d][_downrow][_downcol] = {'passage': 'down1', 'visited': false, 'sanity': 5, 'stairsdown': true};
      if (_uprow != null && _upcol != null)
        this.map[d][_uprow][_upcol] = {'passage': 'up1', 'visited': false, 'sanity': 5, 'stairsup': true};
    }
    console.log(this.map);
  }

  hasCharacter(row, col, depth) {
    if (this.eventCharacters[`${depth}:${row}:${col}`])
      return true;
    return false;
  }
  getCharacter(row, col, depth) {
    return this.eventCharacters[`${depth}:${row}:${col}`];
  }
  createCharacter(row, col, depth, type) {
    if (type == "monster") {
      this.eventCharacters[`${depth}:${row}:${col}`] = { 'type': type, 'monster': _monsters[getRandomInteger(0, _monsters.length)] };

    } else
      this.eventCharacters[`${depth}:${row}:${col}`] = { 'type': type };
    return this.eventCharacters[`${depth}:${row}:${col}`];
  }
  destroyCharacter(row, col, depth) {
    this.eventCharacters[`${depth}:${row}:${col}`] = null;
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
      else if (_r < 0.75)
        return { 'event': 'monster', 'return': true };
      else
        return { 'event': 'tbd', 'return': true };
    } else
      return { 'event': null, 'return': false };
  }

  vizMap(depth) {
    // let ret = "<table>";
    let ret = "<div class='map-container'>"
    for (let r = 0; r < this.mapHeight; r++) {
      // ret += "<tr>";
      for (let c = 0; c < this.mapWidth; c++) {
        let _cls;
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
          if (this.getPassage(r, c, depth) == setup.prefabs[0])
            _cls += ' empty';
          // else if (this.getPassage(r,c) == setup.prefabs[1])
          else if ([setup.prefabs[1], setup.prefabs[2], setup.prefabs[3]].indexOf(this.getPassage(r, c, depth)) >= 0)
            _cls += ' cavern';
          else if (this.getPassage(r, c, depth) == setup.prefabs[4])
            _cls += ' tight';
          else if (this.getPassage(r, c, depth) == setup.prefabs[5])
            _cls += ' stream';
          else if (this.getPassage(r, c, depth) == setup.prefabs[6])
            _cls += ' pool';
          else if (this.getPassage(r, c, depth) == 'down1')
            _cls += ' down';
          else if (this.getPassage(r, c, depth) == 'up1')
            _cls += ' up';
          
          else
            _cls += ' void';
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


  // cardinal directions only
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
      _wait.depth = player.depth-1;
    } else if (this.map[player.depth][player.row][player.col].stairsdown) {
      _wait.text = ">";
      _wait.stairsdown = true; // duplicate for easier check in TW
      _wait.depth = player.depth+1;
    }

    // set depths to player's
    for (let i = 0; i < _passages.length; i++) {
      if (!_passages[i].stairsdown && !_passages[i].stairsup)
        _passages[i]['depth'] = player.depth;
    }

    _passages.push(_wait);

    return _passages;
  }

  generateFriends() {
    let _friendLocations = {};
    let _friends = [];

    for (let i = 0; i < 4; i++) {
      let _name = `Friend${i}`;

      let _row, _col, _indx;
      do {
        _row = getRandomInteger(2, this.map.length);
        _col = getRandomInteger(2, this.map[_row].length);
        _indx = `${_row}:${_col}`;
      } while (_indx.indexOf(_friendLocations) >= 0);
      _friendLocations[_indx] = i;

      // let _friend = new Character(_name, -1, -1, -1, _row, _col);
      let _friend = new Character(_name, -1, -1, -1, 2, 2, i);
      _friends.push(_friend);
    }

    return _friends;
  }

  generateCharacter(row, col) {
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
