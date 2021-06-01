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

  // link up blocks, lowercase letters only at this point
  let dirTiles = "abcdefghijklmnopqrstuvwxyz";

  // if we have a preset
  if (levels[level]) {
    for (const [key, value] of Object.entries(levels[level])) {
      if (key == "start") // starting point
        startChunk = value;
      else {
        chunk = key;
        tiles[chunk] = [];
        for (let i = 0; i < numTiles; i++) {
          tiles[chunk][i] = [];
          for (let j = 0; j < numTiles; j++) {
            if (inBounds(i, j)) { // ignore walls
              if (value[j][i] == "0") {
                if (String(level).indexOf("cave") >= 0) {// rock walls
                  tiles[chunk][i][j] = new ImpassableRock(i, j); // normal walls else
                } else
                  tiles[chunk][i][j] = new Wall(i, j); // normal walls else
              } else if (value[j][i] == "2")
                tiles[chunk][i][j] = new Water(i, j);
              //tiles[chunk][i][j] = new Water(i, j);
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
              } else {
                tiles[chunk][i][j] = new Campfire(i, j);
              }
              passableTiles++;
            } else {
              if (String(level).indexOf("cave") >= 0) {// rock walls
                tiles[chunk][i][j] = new ImpassableRock(i, j); // normal walls else
              } else
                tiles[chunk][i][j] = new Wall(i, j); // normal walls else
              // tiles[chunk][i][j] = new Wall(i, j);
            }
          }
        }
      }
    }
    chunk = startChunk; // set starting chunk
  } else if (level == "overworld") {
    // try for 100x100
    let map_mid_r = Math.floor(chunksHeight / 2)
    let map_mid_c = Math.floor(chunksWidth / 2)

    let caves_r = map_mid_r; // randomize
    let caves_c = 0; // randomize

    for (let map_c = 0; map_c < chunksWidth; map_c++) {
      for (let map_r = 0; map_r < chunksHeight; map_r++) {
        let _chunk = getChunkID(map_r, map_c);
        tiles[_chunk] = [];

        mid_r = Math.floor(numTiles / 2);
        mid_c = mid_r;

        for (let i = 0; i < numTiles; i++) {
          tiles[_chunk][i] = [];
          for (let j = 0; j < numTiles; j++) {
            if (inBounds(i, j)) {
              if (i == 1 && j == mid_c && map_c > 0) {
                tiles[_chunk][i][j] = new Arrow(i, j, "left");
                tiles[_chunk][i][j].stairs = true;
                tiles[_chunk][i][j].nextChunk = getChunkID(map_r, map_c - 1);
              } else if (i == (numTiles - 2) && j == mid_c && map_c < (chunksWidth - 1)) {
                tiles[_chunk][i][j] = new Arrow(i, j, "right");
                tiles[_chunk][i][j].stairs = true;
                tiles[_chunk][i][j].nextChunk = getChunkID(map_r, map_c + 1);
              } else if (j == 1 && i == mid_r && map_r > 0) {
                tiles[_chunk][i][j] = new Arrow(i, j, "up");
                tiles[_chunk][i][j].stairs = true;
                tiles[_chunk][i][j].nextChunk = getChunkID(map_r - 1, map_c);
              } else if (j == (numTiles - 2) && i == mid_r && map_r < (chunksHeight - 1)) {
                tiles[_chunk][i][j] = new Arrow(i, j, "down");
                tiles[_chunk][i][j].stairs = true;
                tiles[_chunk][i][j].nextChunk = getChunkID(map_r + 1, map_c);
              } else {

                // simplex
                let _noise = noiseGen.get2DNoise(j * map_c, i * map_r);
                if (_noise < 0.2)
                  tiles[_chunk][i][j] = new Floor(i, j);
                else if (_noise < 0.1)
                  tiles[_chunk][i][j] = new Beach(i, j);
                else if (_noise < 0.4)
                  tiles[_chunk][i][j] = new Water(i, j);
                else if (_noise < 0.45)
                  tiles[_chunk][i][j] = new Beach(i, j);
                else if (_noise < 0.7)
                  tiles[_chunk][i][j] = new Foliage(i, j);
                else
                  tiles[_chunk][i][j] = new Floor(i, j);

              }
              passableTiles++;
            } else {
              tiles[_chunk][i][j] = new Tree(i, j);
            }
          }
        }

        // let the player visit the tutorial castle again?
        if (map_c == map_mid_c && map_r == map_mid_r) {
          tiles[_chunk][mid_c][mid_r] = new Spire(mid_c, mid_r, 1);
        }

        if (map_c == caves_c && map_r == caves_r) {
          tiles[_chunk][2][2] = new Cave(2, 2, "caves1");
        }
      }
    }

  } else {
    chunk = level;
    tiles[chunk] = [];

    // if (level == 2) {
    //   for (let i = 0; i < mapWidth; i++) {
    //     tiles[chunk][i] = [];
    //     for (let j = 0; j < mapHeight; j++) {
    //       if (inBounds(i, j, mapWidth, mapHeight)) {
    //         tiles[chunk][i][j] = new Floor(i, j);
    //         passableTiles++;
    //       } else {
    //         tiles[chunk][i][j] = new Wall(i, j);
    //       }
    //     }
    //   }
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
      }
    }
    //}
  }

  // post processing
  if (level == 1) {
    let _mid = Math.floor(numTiles / 2);
    tiles[chunk][_mid][_mid].replace(Teleporter);
    tiles[chunk][_mid][_mid].stairs = true;
    tiles[chunk][_mid][_mid].dest = getChunkID(Math.floor(chunksHeight / 2), Math.floor(chunksWidth / 2));
  } else if (level == numLevels) {
    let _t = randomPassableTile();
    _t.crown = true;
  }

  return passableTiles;
}

function inBounds(x, y, maxw, maxh) {
  if (maxw && maxh) // large map
    return x > 0 && y > 0 && x < maxw - 1 && y < maxh - 1;
  else // small map
    return x > 0 && y > 0 && x < numTiles - 1 && y < numTiles - 1;
}


function getTile(x, y, maxw, maxh) {
  // if (maxw && maxh) {
  //   if (inBounds(x, y, maxw, maxh)) { // larger map
  //     return tiles[chunk][x][y];
  //   } else {
  //     return new Wall(x, y);
  //   }
  // } else {
  //   if (inBounds(x, y)) {
  return tiles[chunk][x][y];
  //   } else {
  //     return new Wall(x, y);
  //   }
  // }
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