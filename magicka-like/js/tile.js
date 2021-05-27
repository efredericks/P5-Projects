const TileTable = {
  'player': { 'row': 14, 'col': 35 },
  'health': { 'row': 22, 'col': 7 },
  'wall': { 'row': 17, 'col': 1 },
  'teleporter': { 'row': 18, 'col': 14 },
  'floor': { 'row': 0, 'col': 1 },
  'blueCrab': { 'row': 7, 'col': 18 },
  'goblin': { 'row': 2, 'col': 29 },
  'corpse': { 'row': 15, 'col': 0 },
  'mage': { 'row': 1, 'col': 24 },
  'ghost': { 'row': 6, 'col': 26 },
  'enemyTP': { 'row': 21, 'col': 40 },
  'stairs': { 'row': 6, 'col': 3 },
  'treasure': { 'row': 4, 'col': 41 },
  'water': { 'row': 5, 'col': 8 },
  'potion': { 'row': 13, 'col': 32 },
  'torch': { 'row': 10, 'col': 15 },
  'crown': { 'row': 2, 'col': 43 },
  /// directions
  'left': { 'row': 21, 'col': 31 },
  'right': { 'row': 21, 'col': 29 },
  'up': { 'row': 21, 'col': 28 },
  'down': { 'row': 21, 'col': 30 },

  /// spells
  'aura': { 'row': 4, 'col': 41 },
  'dash': { 'row': 4, 'col': 41 },
  'bolt': { 'row': 11, 'col': 30 },
  'explosion': { 'row': 4, 'col': 41 },
  'npc': { 'row': 14, 'col': 37 },
};

class Tile {
  constructor(x, y, sprite, passable) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.passable = passable;
  }

  replace(newTileType) {
    tiles[chunk][this.x][this.y] = new newTileType(this.x, this.y);
    return tiles[chunk][this.x, this.y];
  }

  // manhattan distance
  dist(other) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  getNeighbor(dx, dy) {
    return getTile(this.x + dx, this.y + dy)
  }

  getAdjacentNeighbors() {
    return shuffle([
      this.getNeighbor(0, -1),
      this.getNeighbor(0, 1),
      this.getNeighbor(-1, 0),
      this.getNeighbor(1, 0)
    ]);
  }

  getAdjacentPassableNeighbors() {
    return this.getAdjacentNeighbors().filter(t => t.passable);
  }

  getConnectedTiles() {
    let connectedTiles = [this];
    let frontier = [this];
    while (frontier.length) {
      let neighbors = frontier.pop()
        .getAdjacentPassableNeighbors()
        .filter(t => !connectedTiles.includes(t));
      connectedTiles = connectedTiles.concat(neighbors);
      frontier = frontier.concat(neighbors);
    }
    return connectedTiles;
  }

  // getNeighbor(dx, dy) {
  //   return getTile(this.x + dx, this.y + dy);
  // }

  // getAdjacentNeighbors() {
  //   return shuffle([
  //     this.getNeighbor(0, -1),
  //     this.getNeighbor(0, 1),
  //     this.getNeighbor(-1, 0),
  //     this.getNeighbor(1, 0)
  //   ]);
  // }

  // getAdjacentPassableNeighbors() {
  //   return this.getAdjacentNeighbors().filter(t => t.passable);
  // }

  // getConnectedTiles() {
  //   let connectedTiles = [this];
  //   let frontier = [this];
  //   while (frontier.length) {
  //     let neighbors = frontier.pop()
  //       .getAdjacentPassableNeighbors()
  //       .filter(t => !connectedTiles.includes(t));
  //     connectedTiles = connectedTiles.concat(neighbors);
  //     frontier = frontier.concat(neighbors);
  //   }
  //   return connectedTiles;
  // }

  draw() {
    drawSprite(this.sprite, this.x, this.y);

    if (this.treasure) {
      drawSprite('treasure', this.x, this.y);
    }
    if (this.potion) {
      drawSprite('potion', this.x, this.y);
    }
    if (this.crown) {
      drawSprite('crown', this.x, this.y);
    }

    if (this.effectCounter) {
      this.effectCounter--;
      ctx.globalAlpha = this.effectCounter / 30;
      drawSprite(this.effect, this.x, this.y);
      ctx.globalAlpha = 1;
    }
  }

  setEffect(effectSprite) {
    this.effect = effectSprite;
    this.effectCounter = 30;
  }
}

class Floor extends Tile {
  constructor(x, y, s) {
    if (s) // pass in a sprite
      super(x, y, s, true);
    else
      super(x, y, 'floor', true);
  }

  stepOn(monster) {
    if (monster.isPlayer && this.treasure) {
      score++;
      if (score % 3 == 0 && numSpells < 9) {
        numSpells++;
        player.addSpell();
      }
      this.treasure = false;
      spawnMonster();
    } else if (monster.isPlayer && this.crown) { /// TBD: EXTEND THIS TO ANY QUEST ITEM!!!!!
      level = 1;
      chunk = level;
      startLevel(Math.min(player.maxHP, player.hp + 1));
      score += 50;
      this.crown = false;
      for (let i = 0; i < npcs.length; i++) {
        if (npcs[i].name == "Ingmar Tutorialman")
          npcs[i].dialogue.quest = "done";
      }
    } else if (monster.isPlayer && this.potion) {
      player.heal(3);
      this.potion = false;
    }
  }
}

class Water extends Floor {
  constructor(x, y) {
    super(x, y, 'water', true);
  }
}
class Torch extends Floor {
  constructor(x, y) {
    super(x, y, 'torch', true);
  }
}

class Wall extends Tile {
  constructor(x, y) {
    super(x, y, 'wall', false);
  }

  stepOn(monster) {
    console.log("WhY");
  }
}

class Teleporter extends Tile {
  constructor(x, y) {
    super(x, y, 'teleporter', true);
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      console.log("Im leaving!");
    }
  }
}

class Arrow extends Tile {
  constructor(x, y, dir) {
    if (dir == "left")
      super(x, y, 'left', true);
    else if (dir == "right")
      super(x, y, 'right', true);
    else if (dir == "up")
      super(x, y, 'up', true);
    else
      super(x, y, 'down', true);
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      //console.log("Im leaving to " + this.nextChunk);
      //console.log(tiles);
      chunk = this.nextChunk;
      if (monster.tile.x == 1)
        monster.tryMove(1,0);
      else if (monster.tile.x == (numTiles-2))
        monster.tryMove(-1,0);
      else if (monster.tile.y == 1)
        monster.tryMove(0,1);
      else
        monster.tryMove(0,-1);
    }
  }
}

class Exit extends Tile {
  constructor(x, y) {
    super(x, y, 'stairs', true);
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      if (level == numLevels) {
        player.priorLocation = (this.x,this.y);
        addScore(score, true);
        showTitle();
      } else {
        level++;
        chunk = level;
        startLevel(Math.min(player.maxHP, player.hp + 1));
      }
    }
  }
}
