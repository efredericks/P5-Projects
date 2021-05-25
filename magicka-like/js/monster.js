class Monster {
  constructor(tile, sprite, hp, maxHP) {
    this.move(tile);
    this.sprite = sprite;
    this.hp = hp;
    this.maxHP = maxHP;
    this.teleportCounter = 2;
    this.offsetX = 0;
    this.offsetY = 0;
    this.lastMove = [-1, 0];
    this.bonusAttack = 0;
  }

  draw() {
    if (this.teleportCounter > 0)
      drawSprite('enemyTP', this.getDisplayX(), this.getDisplayY());
    else {
      drawSprite(this.sprite, this.getDisplayX(), this.getDisplayY());
      this.drawHP();
    }

    this.offsetX -= Math.sign(this.offsetX) * (1/8);
    this.offsetY -= Math.sign(this.offsetY) * (1/8);
  }

// function drawSprite(sprite, x, y) {
//   console.assert(TileTable.hasOwnProperty(sprite));
//   let offset = getSpriteOffset(TileTable[sprite].row, TileTable[sprite].col, 16, 16);//tileSize, tileSize);
//   ctx.drawImage(
//     spriteSheet,
//     offset['dx'],
//     offset['dy'],
//     //sprite*16,
//     //0,
//     16,
//     16,
//     x * tileSize + shakeX,
//     y * tileSize + shakeY,
//     tileSize,
//     tileSize
//   );
//   // let offset = getSpriteOffset(tilePositions[_tile]['row'], tilePositions[_tile]['col']);
//   // bg_buffer.image(spriteSheet, _c * TILE_WIDTH, _r * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, offset['dx'], offset['dy'], TILE_WIDTH, TILE_HEIGHT);
// }


  drawHP() {
    let percHealth = this.hp / this.maxHP;

    let i = 0;
      drawHealthBar(
        this.getDisplayX() + (i % 3) * (5 / 16),
        this.getDisplayY() - Math.floor(i / 3) * (5 / 16),
        100, 24,
        percHealth
      );
  }

  heal(damage) {
    this.hp = Math.min(this.maxHP, this.hp + damage);
  }

  update() {
    this.teleportCounter--;
    if (this.stunned || this.teleportCounter > 0) {
      this.stunned = false;
      return;
    }

    this.doStuff();
  }

  doStuff() {
    let neighbors = this.tile.getAdjacentPassableNeighbors();
    neighbors = neighbors.filter(t => !t.monster || t.monster.isPlayer);
    if (neighbors.length) {
      neighbors.sort((a, b) => a.dist(player.tile) - b.dist(player.tile));
      let newTile = neighbors[0];
      this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
    }
  }

  tryMove(dx, dy) {
    let newTile = this.tile.getNeighbor(dx, dy);
    if (newTile.passable) {
      this.lastMove = [dx, dy];
      if (!newTile.monster) {
        this.move(newTile);
      } else {
        if (newTile.monster.isNPC) {
          gameState = "dialogue";
          dialogueText(newTile.monster);
        } else if (this.isPlayer != newTile.monster.isPlayer) {
          this.attackedThisTurn = true;
          newTile.monster.stunned = true;
          newTile.monster.hit(1 + this.bonusAttack);
          this.bonusAttack = 0;

          shakeAmount = 5;

          this.offsetX = (newTile.x - this.tile.x) / 2;
          this.offsetY = (newTile.y - this.tile.y) / 2;
        }
      }
      return true;
    }
  }

  hit(damage) {
    if (this.shield > 0)
      return;

    this.hp -= damage;
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.dead = true;
    this.tile.monster = null;
    this.sprite = 'corpse';
  }

  move(tile) {
    if (this.tile) {
      this.tile.monster = null;
      this.offsetX = this.tile.x - tile.x;
      this.offsetY = this.tile.y - tile.y;
    }
    this.tile = tile;
    tile.monster = this;
    tile.stepOn(this);
  }

  getDisplayX() {
    return this.tile.x + this.offsetX;
  }
  getDisplayY() {
    return this.tile.y + this.offsetY;
  }
}

class NPC extends Monster {
  constructor(tile, name) {
    super(tile, 'npc', 99, 99);
    this.name = name;
    this.isNPC = true;
    this.dialogue = dialogue[this.name];//["Hey there adventurer", "How's it hangin?", "Did you know there's a hidden Ring of Fart?"];
    this.dialogueIndex = 0;
  }

  getDialogue() {
    let ret_text = this.dialogue[this.dialogueIndex];
    this.dialogueIndex++;
    if (this.dialogueIndex > (this.dialogue.length-1))
      this.dialogueIndex = 0;
    return ret_text;
  }

  interact() {
  }

  doStuff() {
  }
}

class Player extends Monster {
  constructor(tile) {
    super(tile, 'player', 5, 10);
    this.isPlayer = true;
    this.teleportCounter = 0;
    this.spells = shuffle(Object.keys(spells)).splice(0, numSpells);
  }

  update() {
    this.shield--;
  }

  tryMove(dx, dy) {
    if (super.tryMove(dx, dy)) {
      tick();
    }
  }

  wait() {
    this.heal(0.5)
    tick();
  }

  addSpell() {
    let newSpell = shuffle(Object.keys(spells))[0];
    this.spells.push(newSpell);
  }

  castSpell(index) {
    let spellName = this.spells[index];
    if (spellName) {
      delete this.spells[index];
      spells[spellName]();
      tick();
    }
  }
}

class BlueCrab extends Monster {
  constructor(tile) {
    super(tile, 'blueCrab', 3, 3);
  }

  doStuff() {
    this.attackedThisTurn = false;
    super.doStuff();

    if (!this.attackedThisTurn) {
      super.doStuff();
    }
  }
}

class Goblin extends Monster {
  constructor(tile) {
    super(tile, 'goblin', 5, 5);
  }

  update() {
    let startStunned = this.stunned;
    super.update();

    if (!startStunned) {
      this.stunned = true;
    }
  }
}

class Mage extends Monster {
  constructor(tile) {
    super(tile, 'mage', 5, 5);
  }

  // eat walls for health because reasons
  doStuff() {
    let neighbors = this.tile.getAdjacentNeighbors().filter(t => !t.passable && inBounds(t.x, t.y));
    if (neighbors.length) {
      neighbors[0].replace(Floor);
      this.heal(0.5);
    } else {
      super.doStuff();
    }
  }
}

class Ghost extends Monster {
  constructor(tile) {
    super(tile, 'ghost', 5, 5);
  }

  // move randomly
  doStuff() {
    let neighbors = this.tile.getAdjacentPassableNeighbors();
    if (neighbors.length) {
      this.tryMove(neighbors[0].x - this.tile.x, neighbors[0].y - this.tile.y);
    }

  }
}