function generateLevel() {
  tryTo('generate map', function () {
    return generateTiles() == randomPassableTile().getConnectedTiles().length;
  });
  if (level > 1)
    generateMonsters();
  else {
    monsters = [];
    generateNPCs();
  }

  for (let i = 0; i < 3; i++) {
    randomPassableTile().treasure = true;
  }
}

function generateTiles() {
  let passableTiles = 0;
  tiles = [];
  for (let i = 0; i < numTiles; i++) {
    tiles[i] = [];
    for (let j = 0; j < numTiles; j++) {
      if (level == 1) {
        if (inBounds(i, j)) {
          tiles[i][j] = new Floor(i, j);
          passableTiles++;
        } else {
          tiles[i][j] = new Wall(i, j);
        }

      } else if (level > 2) {
        if (Math.random() < 0.3 || !inBounds(i, j)) {
          tiles[i][j] = new Wall(i, j);
        } else {
          tiles[i][j] = new Floor(i, j);
          passableTiles++;
        }
      } else {
        if (inBounds(i, j)) {
          tiles[i][j] = new Floor(i, j);
          passableTiles++;
        } else {
          tiles[i][j] = new Wall(i, j);
        }
      }

    }
  }
  return passableTiles;
}

function inBounds(x, y) {
  return x > 0 && y > 0 && x < numTiles - 1 && y < numTiles - 1;
}


function getTile(x, y) {
  if (inBounds(x, y)) {
    return tiles[x][y];
  } else {
    return new Wall(x, y);
  }
}

function randomPassableTile() {
  let tile;
  tryTo('get random passable tile', function () {
    let x = getRandomInteger(0, numTiles); //randomRange(0,numTiles-1);
    let y = getRandomInteger(0, numTiles); //randomRange(0,numTiles-1);
    tile = getTile(x, y);
    return tile.passable && !tile.monster;
  });
  return tile;
}

function generateNPCs() {
  npcs = [];
  if (level == 1) {
    let npc = new NPC(randomPassableTile());
    npcs.push(npc);
  }
}

function generateMonsters() {
  monsters = [];

  if (level > 1) {

    let numMonsters = level + 1;
    for (let i = 0; i < numMonsters; i++) {
      spawnMonster();
    }
  }
}

function spawnMonster() {
  let monsterType = shuffle([BlueCrab, Goblin, Mage, Ghost])[0];
  let monster = new monsterType(randomPassableTile());
  monsters.push(monster);
}