function generateLevel() {
  npcs = [];

  tryTo('generate map', function () {
    return generateTiles() == randomPassableTile().getConnectedTiles().length;
  });
  if (level > 1) {
    generateMonsters();
  } else {
    monsters = [];
    generateNPCs();
  }

  // abstract this to be *any* item
  for (let i = 0; i < 3; i++) {
    randomPassableTile().treasure = true;
    if (Math.random() > 0.5)
      randomPassableTile().potion = true;
  }
}

function generateTiles() {
  let passableTiles = 0;
  tiles = [];

  // if we have a preset
  if (levels[level]) {


    for (let i = 0; i < numTiles; i++) {
      tiles[i] = [];
      for (let j = 0; j < numTiles; j++) {
        if (TileLookup[levels[level][j][i]] == "wall")
          tiles[i][j] = new Wall(i, j);
        else if (TileLookup[levels[level][j][i]] == "water"){
          tiles[i][j] = new Water(i, j);
          passableTiles++;
        } else if (TileLookup[levels[level][j][i]] == "torch"){
          tiles[i][j] = new Torch(i, j);
          passableTiles++;
        } else {
          tiles[i][j] = new Floor(i, j);
          passableTiles++;
        }
      }
    }







  } else {
    for (let i = 0; i < numTiles; i++) {
      tiles[i] = [];
      for (let j = 0; j < numTiles; j++) {
        if (level == 1) {
          if (inBounds(i, j)) {
            // bound with a moat for level 1
            if (i == 1 || i == (numTiles - 2) || j == 1 || j == (numTiles - 2))
              tiles[i][j] = new Water(i, j);
            else
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
  }

  // post processing
  if (level == 1) {
    let _mid = Math.floor(numTiles / 2);
    tiles[_mid][_mid].replace(Teleporter);
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
    let npc = new NPC(randomPassableTile(), "Ingmar Tutorialman");
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