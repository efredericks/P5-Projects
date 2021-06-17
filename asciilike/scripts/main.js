///globals
///helper functions
function getSpriteOffset(row, col) {
  let dx = col * TILE_WIDTH;
  let dy = row * TILE_HEIGHT;
  return { 'dx': dx, 'dy': dy };
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
  'void'
];

class GameManager {
  constructor() {
    this.map = [];
    this.monsters = [];
    this.npcs = [];
    this.mapWidth = 10;
    this.mapHeight = 10;
    this.init();

    this.fightActive = false;
    this.activeMonster = null;

    this.friends = this.generateFriends();

    this.player = new Character("Erik", 1, 10, 1, 0, 0);
    this.player.isPlayer = true;
    this.monster = null;
  }
  init() {
    for (let r = 0; r < this.mapHeight; r++) {
      this.map[r] = [];
      for (let c = 0; c < this.mapWidth; c++) {
        if (r == 0 && c == 0) // always start at 0,0
          this.map[r][c] = 'start';
        else {
          this.map[r][c] = setup.prefabs[getRandomInteger(0, setup.prefabs.length)];
        }
      }
    }
  }

  getPassage(row, col) {
    return this.map[row][col];
  }

  // cardinal directions only
  getPassages() {
    let _passages = [];

    // north
    if (this.player.row > 0)
      _passages.push({row:-1, col:0});
    // south
    if (this.player.row < this.map.length - 1)
      _passages.push({row:1, col:0});
    // east
    if (this.player.col > 0)
      _passages.push({row:0, col:-1});
    // west
    if (this.player.col < this.map[0].length - 1)
      _passages.push({row:0, col:1});

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

      let _friend = new Character(_name, -1, -1, -1, _row, _col);
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
  }

  getHP() {
    let cls = "red";
    if (this.isPlayer) // || this.friendly?
      cls = "green";
    return "<span class='" + cls + "'>" + this.hp + "/" + this.max_hp + "</span>";
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
