let canvas, ctx;
let tileSize;
let numTiles;
let uiWidth;
let spriteSheet;
let player;
let level;
let gameState;
let startingHP;
let numLevels;
let numSpells;
let score;
let shakeAmount;
let shakeX;
let shakeY;
let chunk;

const keyboardConfig = {
};

function setupCanvas() {
  canvas = document.querySelector("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = tileSize * (numTiles + uiWidth);
  canvas.height = tileSize * numTiles;
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  ctx.imageSmoothingEnabled = false;
}

function drawHealthBar(x, y, w, h, perc) {
  let _x = x * tileSize + shakeX;
  let _y = y * tileSize + shakeY + tileSize - 4;
  let _w = (tileSize - 4) * perc;

  // outer bar
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(_x, _y, tileSize, 6);
  ctx.closePath();

  // inner bar
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,255,0,0.8)";
  ctx.fillRect(_x+2, _y+2, _w, 2);
  ctx.closePath();
}

function drawSpriteDirect(sprite, x, y, scale) {
  console.assert(TileTable.hasOwnProperty(sprite));
  let offset = getSpriteOffset(TileTable[sprite].row, TileTable[sprite].col, 16, 16);//tileSize, tileSize);
  ctx.drawImage(
    spriteSheet,
    offset['dx'],
    offset['dy'],
    16,
    16,
    x,//x * tileSize + shakeX,
    y,//y * tileSize + shakeY,
    scale,//tileSize,
    scale//tileSize
  );
  // let offset = getSpriteOffset(tilePositions[_tile]['row'], tilePositions[_tile]['col']);
  // bg_buffer.image(spriteSheet, _c * TILE_WIDTH, _r * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, offset['dx'], offset['dy'], TILE_WIDTH, TILE_HEIGHT);
}

function drawSprite(sprite, x, y) {
  console.assert(TileTable.hasOwnProperty(sprite));
  let offset = getSpriteOffset(TileTable[sprite].row, TileTable[sprite].col, 16, 16);//tileSize, tileSize);
  ctx.drawImage(
    spriteSheet,
    offset['dx'],
    offset['dy'],
    //sprite*16,
    //0,
    16,
    16,
    x * tileSize + shakeX,
    y * tileSize + shakeY,
    tileSize,
    tileSize
  );
  // let offset = getSpriteOffset(tilePositions[_tile]['row'], tilePositions[_tile]['col']);
  // bg_buffer.image(spriteSheet, _c * TILE_WIDTH, _r * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, offset['dx'], offset['dy'], TILE_WIDTH, TILE_HEIGHT);
}

function tick() {
  for (let k = monsters.length - 1; k >= 0; k--) {
    if (!monsters[k].dead) {
      monsters[k].update();
    } else {
      monsters.splice(k, 1);
    }
  }

  for (let k = npcs.length - 1; k >= 0; k--) {
    if (!npcs[k].dead) {
      npcs[k].update();
    } else {
      npcs.splice(k, 1);
    }
  }

  player.update();
  if (player.dead) {
    addScore(score, false);
    gameState = 'dead';
  }

  // no monsters on level 1 unless if you pick up the gold
  if (level > 1) {
    spawnCounter--;
    if (spawnCounter <= 0) {
      spawnMonster();
      spawnCounter = spawnRate;
      spawnRate--;
    }

  }
}

function showTitle() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  gameState = 'title';

  drawText("CozyRL", 40, true, canvas.height / 2 - 40, "white");
  drawScores();
}

function drawScores() {
  let scores = getScores();
  if (scores.length) {
    drawText(
      rightPad(["RUN", "SCORE", "TOTAL"]),
      18,
      true,
      canvas.height / 2,
      "white"
    );

    let newestScore = scores.pop();
    scores.sort(function (a, b) {
      return b.totalScore - a.totalScore;
    });
    scores.unshift(newestScore);

    for (let i = 0; i < Math.min(10, scores.length); i++) {
      let scoreText = rightPad([scores[i].run, scores[i].score, scores[i].totalScore]);
      drawText(
        scoreText,
        14,
        true,
        canvas.height / 2 + 24 + i * 24,
        i == 0 ? "aqua" : "violet"
      );
    }
  }
}

function rightPad(textArray) {
  let finalText = "";
  textArray.forEach(text => {
    text += "";
    for (let i = text.length; i < 10; i++) {
      text += " ";
    }
    finalText += text;
  });
  return finalText;
}

function startGame() {
  level = 1;
  score = 0;
  numSpells = 0;

  startLevel(startingHP);
  gameState = 'running';
}

function startLevel(playerHP, playerSpells) {
  spawnRate = 15;
  spawnCounter = spawnRate;
  generateLevel();
  player = new Player(getTile(2,2));//randomPassableTile());
  player.hp = playerHP;

  if (playerSpells)
    player.spells = playerSpells;

  randomPassableTile().replace(StairsDown);
  if (level > 1)
    randomPassableTile().replace(StairsUp);
}

function getScores() {
  if (localStorage["ml-scores"]) {
    return JSON.parse(localStorage["ml-scores"]);
  } else {
    return [];
  }
}

function addScore(score, won) {
  let scores = getScores();
  let scoreObject = { score: score, run: 1, totalScore: score, active: won };
  let lastScore = scores.pop();

  if (lastScore) {
    if (lastScore.active) {
      scoreObject.run = lastScore.run + 1;
      scoreObject.totalScore += lastScore.totalScore;
    } else {
      scores.push(lastScore);
    }
  }

  scores.push(scoreObject);
  localStorage["ml-scores"] = JSON.stringify(scores);
}

function screenshake() {
  if (shakeAmount)
    shakeAmount--;

  let shakeAngle = Math.random() * Math.PI * 2;
  shakeX = Math.round(Math.cos(shakeAngle) * shakeAmount);
  shakeY = Math.round(Math.sin(shakeAngle) * shakeAmount);
}

function draw() {
  if (gameState == 'running' || gameState == 'dead') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    screenshake();

    //ctx.fillStyle = "#472D3C";
    //ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numTiles; i++) {
      for (let j = 0; j < numTiles; j++) {
        getTile(i, j).draw();
      }
    }

    for (let i = 0; i < monsters.length; i++) {
      monsters[i].draw();
    }

    //TBD: do same for monsters
    chunkNPCs = npcs.filter(t => t.chunk == chunk);
    for (let i = 0; i < chunkNPCs.length; i++) {
      chunkNPCs[i].draw();
    }


    player.draw();

    drawText("Level: " + level, 20, false, 40, "rgba(255,255,255)");
    drawText("Score: " + score, 20, false, 70, "violet");

    for (let i = 0; i < player.spells.length; i++) {
      let spellText = (i + 1) + ") " + (player.spells[i] || "");
      drawText(spellText, 14, false, 110 + i * 40, "aqua");
    }

    ctx.closePath();

    //drawSprite(6, x, y); // only works on first line
  } else if (gameState == "dialogue") {
    ;
  }
}

function drawText(text, size, centered, textY, color, inTextX) {
  ctx.fillStyle = color;
  ctx.font = size + "px monospace";
  let textX;
  if (centered)
    textX = (canvas.width - ctx.measureText(text).width) / 2;
  else
    textX = canvas.width - uiWidth * tileSize + 25;

  if (inTextX)
    textX = inTextX;

  ctx.fillText(text, textX, textY);
}

function dialogueText(monster) {
  let txt = monster.getDialogue();

  /// TBD: I'm willing to be this can be done a lot more intelligently than pixel positioning

  // draw text background
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(10, canvas.height-105, canvas.width-20,100-5);
  ctx.lineJoin = "bevel"; // round
  ctx.lineWidth = "10";
  ctx.strokeStyle = "rgba(255,255,255,1.0)";
  ctx.strokeRect(10, canvas.height - 100 - 10, canvas.width-20, 100);
  ctx.closePath();

  // draw avatar
  ctx.beginPath();
  ctx.fillStyle = "rgba(71,45,60,1.0)";
  ctx.fillRect(40, canvas.height-165, 75, 75);
  ctx.lineJoin = "bevel"; // round
  ctx.lineWidth = "10";
  ctx.strokeStyle = "rgba(255,255,255,1.0)";
  ctx.strokeRect(40, canvas.height-165, 75, 75);
  drawSpriteDirect(monster.sprite, 54, canvas.height-152, 48);
  ctx.closePath();

  // avatar name
  drawText(monster.name, 24, false, canvas.height-120, "white", 124);

  // draw text
  drawText(txt, 24, true, canvas.height - 50 , "white");
}

function debugText() {
  drawText("CozyRL", 40, true, canvas.height / 2 - 40, "white");
}

window.onload = function init() {
  tileSize = 32;//64;
  numTiles = 18;//9;
  uiWidth = 8;

  level = 1;

  gameState = 'loading';
  startingHP = 3;
  numLevels = 6;

  shakeAmount = 0;
  shakeX = 0;
  shakeY = 0;

  spriteSheet = new Image();
  spriteSheet.src = "./assets/colored_packed_modified.png";
  spriteSheet.onload = showTitle;

  document.querySelector("html").onkeypress = function (e) {
    if (gameState == 'title') {
      startGame();
    } else if (gameState == 'dead') {
      for (let i = 0; i < npcs.length; i++)
      showTitle();
    } else if (gameState == 'running') {
      if ((e.key == "w") || (e.key == "k")) player.tryMove(0, -1);
      if ((e.key == "s") || (e.key == "j")) player.tryMove(0, 1);
      if ((e.key == "a") || (e.key == "h")) player.tryMove(-1, 0);
      if ((e.key == "d") || (e.key == "l")) player.tryMove(1, 0);

      if (e.key == "y") player.tryMove(-1, -1);
      if (e.key == "b") player.tryMove(-1, 1);
      if (e.key == "u") player.tryMove(1, -1);
      if (e.key == "n") player.tryMove(1, 1);

      if (e.key == "[") {
        gameState = "dialogue";
        debugText();
      }

      if (e.key == ".") player.wait();
      if (e.key >= 1 && e.key <= 9)
        player.castSpell(e.key - 1);
    } else if (gameState == "dialogue") {
      if (e.key == " " || e.key == "Enter") {
        gameState = "running";
      }
    }
  };

  setInterval(draw, 15);
  setupCanvas();
}
