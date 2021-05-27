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
  tiles = {};
  let startChunk = 1;

  // if we have a preset
  if (levels[level]) {
    for (const [key, value] of Object.entries(levels[level])) {
      if (key == "start") // starting point
        startChunk = value;
      else {
        chunk = key;
        tiles[chunk] = [];

        // link up blocks, lowercase letters only at this point
        let dirTiles = "abcdefghijklmnopqrstuvwxyz";

        for (let i = 0; i < numTiles; i++) {
          tiles[chunk][i] = [];
          for (let j = 0; j < numTiles; j++) {
            if (inBounds(i, j)) { // ignore walls
              if (value[j][i] == "1")
                tiles[chunk][i][j] = new Floor(i, j);
              else if (value[j][i] == "2")
                tiles[chunk][i][j] = new Water(i, j);
              else if (value[j][i] == "3") {
                if (Math.random() > 0.5)
                  tiles[chunk][i][j] = new Floor(i, j, 'tile1');
                else
                  tiles[chunk][i][j] = new Floor(i, j, 'tile2');
              } else if (dirTiles.indexOf(value[j][i]) >= 0) { // an arrow
                if (i == 1)
                  tiles[chunk][i][j] = new Arrow(i, j, "left");
                else if (i == (numTiles - 2))
                  tiles[chunk][i][j] = new Arrow(i, j, "right");
                else if (j == 1)
                  tiles[chunk][i][j] = new Arrow(i, j, "up");
                else
                  tiles[chunk][i][j] = new Arrow(i, j, "down");
                tiles[chunk][i][j].stairs = true;
                tiles[chunk][i][j].nextChunk = value[j][i];
              }
              passableTiles++;
            } else {
              tiles[chunk][i][j] = new Wall(i, j);
            }
          }
        }
      }
    }
    chunk = startChunk; // set starting chunk
  } else {
    chunk = level;
    tiles[chunk] = [];

    // if (level == 2) {

    // } else {

    for (let i = 0; i < numTiles; i++) {
      tiles[chunk][i] = [];
      for (let j = 0; j < numTiles; j++) {
        if (level == 1) {
          if (inBounds(i, j)) {
            // bound with a moat for level 1
            if (i == 1 || i == (numTiles - 2) || j == 1 || j == (numTiles - 2))
              tiles[chunk][i][j] = new Water(i, j);
            else
              tiles[chunk][i][j] = new Floor(i, j);
            passableTiles++;
          } else {
            tiles[chunk][i][j] = new Wall(i, j);
          }

        } else if (level > 2) {
          if (Math.random() < 0.3 || !inBounds(i, j)) {
            tiles[chunk][i][j] = new Wall(i, j);
          } else {
            tiles[chunk][i][j] = new Floor(i, j);
            passableTiles++;
          }
        } else {
          if (inBounds(i, j)) {
            tiles[chunk][i][j] = new Floor(i, j);
            passableTiles++;
          } else {
            tiles[chunk][i][j] = new Wall(i, j);
          }
        }
        //        }
      }
    }
  }

  // post processing
  if (level == 1) {
    let _mid = Math.floor(numTiles / 2);
    tiles[chunk][_mid][_mid].replace(Teleporter);
    tiles[chunk][_mid][_mid].stairs = true;
  } else if (level == numLevels) {
    let _t = randomPassableTile();
    _t.crown = true;
  }

  return passableTiles;
}

function inBounds(x, y) {
  return x > 0 && y > 0 && x < numTiles - 1 && y < numTiles - 1;
}


function getTile(x, y) {
  if (inBounds(x, y)) {
    return tiles[chunk][x][y];
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
    while (!tile.passable && !tile.monster && !tile.stairs) {
      x = getRandomInteger(0, numTiles); //randomRange(0,numTiles-1);
      y = getRandomInteger(0, numTiles); //randomRange(0,numTiles-1);
      tile = getTile(x, y);
    }
    return tile.passable && !tile.monster && !tile.stairs;
  });
  return tile;
}

function generateNPCs() {
  npcs = [];
  if (level == 1) {
    let npc = new NPC(randomPassableTile(), "Ingmar Tutorialman", "a");
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