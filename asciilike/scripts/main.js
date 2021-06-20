///globals
///helper functions


setup.STATES = {
  GAME: 0,
  WIN: 1,
  GAMEOVER: 2,
  DIALOGUE: 3,
  LOST_SANITY: 4,
}

let getRandomInteger = function (min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
window.getRandomInteger = getRandomInteger;

setup.prefabs = [
  'empty',
  'cavern',
  'tight',
  'stream',
  'pool',
  'void',
];

class GameManager {
  constructor() {
    this.map = [];
    this.monsters = [];
    this.npcs = [];
    this.mapWidth = 10;
    this.mapHeight = 10;
    this.noiseGen = new FastSimplexNoise({ frequency: 0.01, octaves: 4 });
    this.init();

    this.fightActive = false;
    this.activeMonster = null;

    this.friends = this.generateFriends();
    this.totalFriends = this.friends.length;
    this.friendsRescued = 0;

    this.player = new Character("Erik", 1, 10, 1, 0, 0);
    this.player.isPlayer = true;
    this.monster = null;
  }
  init() {
    for (let r = 0; r < this.mapHeight; r++) {
      this.map[r] = [];
      for (let c = 0; c < this.mapWidth; c++) {
        if (r == 0 && c == 0) // always start at 0,0
          this.map[r][c] = { 'passage': 'start', 'visited': true, 'sanity': 10 };
        else {
          let randomOffset = getRandomInteger(0, 100000);
          let _noise = this.noiseGen.get2DNoise(c + randomOffset, r + randomOffset);

          let _room = setup.prefabs[0];
          let _sanity = -1;
          if (_noise < 0.0) {
            _room = setup.prefabs[0];
          } else if (_noise < 0.4) {
            _room = setup.prefabs[1];
          } else if (_noise < 0.5) { 
            _room = setup.prefabs[2]; // tight squeeze
            _sanity = -5;
          } else if (_noise < 0.6) { // stream
            _room = setup.prefabs[3];
            _sanity = 5;
          } else if (_noise < 0.7) { // pool 
            _room = setup.prefabs[4];
            _sanity = 5;
          } else if (_noise < 0.8) { // void
            _room = setup.prefabs[5];
            _sanity = -10;
          } else { // empty
            _room = setup.prefabs[0];
          }

          this.map[r][c] = { 'passage': _room, 'visited': false, 'sanity': _sanity };
        }
      }
    }
  }

  vizMap() {
    let ret = "<table>";
    for (let r = 0; r < this.mapHeight; r++) {
      ret += "<tr>";
      for (let c = 0; c < this.mapWidth; c++) {
        let _cls;
        if (this.player.row == r && this.player.col == c)
          _cls = 'active';
        else if (this.getPassageVisited(r, c))
          _cls = 'visited';
        else {
          _cls = '';

          // tbd - temp viz
          if (this.getPassage(r,c) == setup.prefabs[0])
            _cls += ' empty';
          else if (this.getPassage(r,c) == setup.prefabs[1])
            _cls += ' cavern';
          else if (this.getPassage(r,c) == setup.prefabs[2])
            _cls += ' tight';
          else if (this.getPassage(r,c) == setup.prefabs[3])
            _cls += ' stream';
          else if (this.getPassage(r,c) == setup.prefabs[4])
            _cls += ' pool';
          else
            _cls += ' void';
        }

        ret += "<td class='" + _cls + "'></td>";
      }
      ret += "</tr>";
    }
    ret += "</table>";
    return ret;
  }

  setPassageVisited(row, col) {
    this.map[row][col].visited = true;
  }
  getPassageVisited(row, col) {
    return this.map[row][col].visited;
  }
  getPassage(row, col) {
    return this.map[row][col].passage;
  }

  getMapSanity(row, col) {
    return this.map[row][col].sanity;
  }

  getFriendsHere(row, col) {
    let _friends = [];
    // debugging
    // if (row == 1 && col == 1 && this.friendsRescued == 0) {
    //   _friends.push(this.friends[0]);
    //   _friends.push(this.friends[1]);
    //   _friends.push(this.friends[2]);
    // }
    for (let i = 0; i < this.friends.length; i++) {
      if (this.friends[i].row == row && this.friends[i].col == col)
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
  getPassages() {
    let _passages = [];

    // north
    if (this.player.row > 0)
      _passages.push({ row: -1, col: 0 });
    // south
    if (this.player.row < this.map.length - 1)
      _passages.push({ row: 1, col: 0 });
    // east
    if (this.player.col > 0)
      _passages.push({ row: 0, col: -1 });
    // west
    if (this.player.col < this.map[0].length - 1)
      _passages.push({ row: 0, col: 1 });

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
      let _friend = new Character(_name, -1, -1, -1, 2, 2);
      _friends.push(_friend);
    }

    return _friends;
  }
};
window.GameManager = GameManager;

//player sprite
//let offset = getSpriteOffset(14, 35);
//imgBuffer.image(spriteSheet, 40, 40, TILE_WIDTH, TILE_HEIGHT, offset['dx'], offset['dy'], TILE_WIDTH, TILE_HEIGHT);
class Character {
  constructor(name, level, hp, ac, row, col) {
    this.name = name;
    this.inventory = {};
    this.level = level;
    this.hp = hp;
    this.max_hp = hp;
    this.ac = ac;
    this.row = row;
    this.col = col;
    this.sanity = 100;
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
