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
    let hit_val = window.getRandomInteger(0, dmg+1);
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
