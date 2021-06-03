const TileTable = {
  'player': { 'row': 14, 'col': 35 },
  'health': { 'row': 22, 'col': 7 },
  'wall': { 'row': 17, 'col': 1 },
  'teleporter': { 'row': 18, 'col': 14 },
  'floor': { 'row': 0, 'col': 0 },
  'floor2': { 'row': 0, 'col': 1 },
  'floor3': { 'row': 0, 'col': 2 },
  'floor4': { 'row': 0, 'col': 3 },
  'floor5': { 'row': 0, 'col': 4 },
  'tile1': { 'row': 0, 'col': 16 },
  'tile2': { 'row': 0, 'col': 17 },
  'blueCrab': { 'row': 7, 'col': 18 },
  'goblin': { 'row': 2, 'col': 29 },
  'corpse': { 'row': 15, 'col': 0 },
  'mage': { 'row': 1, 'col': 24 },
  'ghost': { 'row': 6, 'col': 26 },
  'enemyTP': { 'row': 21, 'col': 40 },
  'stairsDown': { 'row': 6, 'col': 3 },
  'stairsUp': { 'row': 6, 'col': 2 },
  'treasure': { 'row': 4, 'col': 41 },
  'water': { 'row': 5, 'col': 8 },
  'potion': { 'row': 13, 'col': 32 },
  'torch': { 'row': 10, 'col': 15 },
  'crown': { 'row': 2, 'col': 43 },
  'campfire': { 'row': 10, 'col': 14 },
  'spire': { 'row': 19, 'col': 2 },
  'cave': { 'row': 9, 'col': 6 },
  'rock': { 'row': 2, 'col': 5 },

  'beach': { 'row': 6, 'col': 47},

  'tree1': { 'row': 1, 'col': 0 },
  'tree2': { 'row': 1, 'col': 1 },
  'tree3': { 'row': 1, 'col': 2 },
  'tree4': { 'row': 1, 'col': 3 },
  'tree5': { 'row': 1, 'col': 4 },
  'tree6': { 'row': 1, 'col': 5 },
  'tree7': { 'row': 2, 'col': 3 },
  'tree8': { 'row': 2, 'col': 4 },

  'foliage1': { 'row': 0, 'col': 5 },
  'foliage2': { 'row': 0, 'col': 6 },
  'foliage3': { 'row': 0, 'col': 7 },
  'foliage4': { 'row': 2, 'col': 0 },



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
    if (!inBounds(this.x, this.y))
      drawSprite(this.sprite, this.x, this.y, 0.3);
    else
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
    else {
      let _r = Math.random();
      if (_r > 0.5)
        super(x, y, 'floor', true);
      else if (_r > 0.3)
        super(x, y, 'floor2', true);
      else if (_r > 0.2)
        super(x, y, 'floor3', true);
      else if (_r > 0.05)
        super(x, y, 'floor4', true);
      else
        super(x, y, 'floor5', true);

    }
  }

  stepOn(monster) {
    if (monster.isPlayer && this.treasure) {
      score++;
      if (score % 3 == 0 && numSpells < 9) {
        numSpells++;
        player.addSpell();
      }
      this.treasure = false;
      spawnMonster(chunk);
    } else if (monster.isPlayer && this.crown) { /// TBD: EXTEND THIS TO ANY QUEST ITEM!!!!!
      level = 1;
      chunk = level;
      startLevel(Math.min(player.maxHP, player.hp + 1));
      score += 50;

      // add to inventory and auto-equip
      this.crown = false;
      player.addItem('CROWN');
      items['CROWN']("add");

      for (let i = 0; i < npcs.length; i++) {
        if (npcs[i].name == "Ingmar Tutorialman")
          npcs[i].dialogue.quest = "done";
      }
    } else if (monster.isPlayer && this.potion) {
      //player.heal(3);
      player.addItem('HP');
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

class Campfire extends Floor {
  constructor(x, y) {
    super(x, y, 'campfire', true);
  }
}

class Foliage extends Floor {
  constructor(x, y) {
    let foliage = ["foliage1", "foliage2", "foliage3", "foliage4"];
    super(x, y, foliage[getRandomInteger(0,foliage.length)], true);
  }
}

class Beach extends Floor {
  constructor(x, y) {
    super(x, y, 'beach', true);
  }
}

class ImpassableRock extends Tile {
  constructor(x, y) {
    //let trees = ["tree1", "tree2", "tree3", "tree4", "tree5", "tree6", "tree7", "tree8"];
    super(x, y, "rock", false);
  }

  stepOn(monster) {
    console.log("violation: rock");
  }
}

class Tree extends Tile {
  constructor(x, y) {
    let trees = ["tree1", "tree2", "tree3", "tree4", "tree5", "tree6", "tree7", "tree8"];
    super(x, y, trees[getRandomInteger(0, trees.length)], false);
  }

  stepOn(monster) {
    console.log("violation: tree");
  }
}

class Wall extends Tile {
  constructor(x, y) {
    super(x, y, 'wall', false);
  }

  stepOn(monster) {
    console.log("violation: wall");
  }
}

class Teleporter extends Tile {
  constructor(x, y, dest) {
    super(x, y, 'teleporter', true);
    this.dest = dest;
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      level = "overworld"
      chunk = this.dest;
      addScore(score, true);
      startLevel(Math.min(player.maxHP, player.hp + 1));
    }
  }

  // stepOn(monster) {
  //   if (monster.isPlayer) {
  //     console.log("Im leaving!");
  //   }
  // }
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

    this.stairs = true;
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      //console.log("Im leaving to " + this.nextChunk);
      //console.log(tiles);
      chunk = this.nextChunk;
      if (monster.tile.x == 1)
        monster.tryMove(1, 0);
      else if (monster.tile.x == (numTiles - 2))
        monster.tryMove(-1, 0);
      else if (monster.tile.y == 1)
        monster.tryMove(0, 1);
      else
        monster.tryMove(0, -1);
    }
  }
}

class StairsUp extends Tile {
  constructor(x, y, nextChunk) {
    super(x, y, 'stairsUp', true);

    if (nextChunk) {
      this.nextChunk = nextChunk;
    }
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      if (level == numLevels) {
        player.priorLocation = (this.x, this.y);
        level = 1;
        chunk = level;
        startLevel(Math.min(player.maxHP, player.hp + 1));
        addScore(score, true);
        showTitle();
      } else if (this.nextChunk) {
        chunk = this.nextChunk;
        level = this.nextChunk;
        startLevel(Math.min(player.maxHP, player.hp + 1));
      } else {
        level--;
        chunk = level;
        startLevel(Math.min(player.maxHP, player.hp + 1));
      }
    }
  }
}

class Spire extends Tile {
  constructor(x, y, nextChunk) {
    super(x, y, 'spire', true);
    this.nextChunk = nextChunk;
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      chunk = this.nextChunk;
      level = this.nextChunk;
      startLevel(Math.min(player.maxHP, player.hp + 1));
    }
  }
}

class Cave extends Tile {
  constructor(x, y, nextChunk) {
    super(x, y, 'cave', true);
    this.nextChunk = nextChunk;
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      chunk = this.nextChunk;
      level = this.nextChunk;
      startLevel(Math.min(player.maxHP, player.hp + 1));
    }
  }
}

class StairsDown extends Tile {
  constructor(x, y) {
    super(x, y, 'stairsDown', true);
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      if (level == numLevels) {
        player.priorLocation = (this.x, this.y);
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
