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
let maxHP;
let score;
let shakeAmount;
let shakeX;
let shakeY;

function setupCanvas() {
  canvas = document.querySelector("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = tileSize * (numTiles + uiWidth);
  canvas.height = tileSize * numTiles;
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  ctx.imageSmoothingEnabled = false;
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

  player.update();
  if (player.dead) {
    addScore(score, false);
    gameState = 'dead';
  }

  spawnCounter--;
  if (spawnCounter <= 0) {
    spawnMonster();
    spawnCounter = spawnRate;
    spawnRate--;
  }
}

function showTitle() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  gameState = 'title';

  drawText("Magicka-like", 40, true, canvas.height / 2 - 40, "white");
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
        18,
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
  numSpells = 9;//1;
  startLevel(startingHP);
  gameState = 'running';
}

function startLevel(playerHP, playerSpells) {
  spawnRate = 15;
  spawnCounter = spawnRate;
  generateLevel();
  player = new Player(randomPassableTile());
  player.hp = playerHP;

  if (playerSpells)
    player.spells = playerSpells;

  randomPassableTile().replace(Exit);
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

    player.draw();

    drawText("Level: " + level, 30, false, 40, "violet");
    drawText("Score: " + score, 30, false, 70, "violet");

    for (let i = 0; i < player.spells.length; i++) {
      let spellText = (i + 1) + ") " + (player.spells[i] || "");
      drawText(spellText, 20, false, 110 + i * 40, "aqua");
    }

    ctx.closePath();

    //drawSprite(6, x, y); // only works on first line
  }
}

function drawText(text, size, centered, textY, color) {
  ctx.fillStyle = color;
  ctx.font = size + "px monospace";
  let textX;
  if (centered)
    textX = (canvas.width - ctx.measureText(text).width) / 2;
  else
    textX = canvas.width - uiWidth * tileSize + 25;

  ctx.fillText(text, textX, textY);
}

window.onload = function init() {
  tileSize = 64;
  numTiles = 9;
  uiWidth = 4;

  level = 1;

  gameState = 'loading';
  startingHP = 3;
  maxHP = 6;
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
      showTitle();
    } else if (gameState == 'running') {
      if (e.key == "w") player.tryMove(0, -1);
      if (e.key == "s") player.tryMove(0, 1);
      if (e.key == "a") player.tryMove(-1, 0);
      if (e.key == "d") player.tryMove(1, 0);
      if (e.key == ".") player.wait();
      if (e.key >= 1 && e.key <= 9)
        player.castSpell(e.key - 1);
    }

  };

  setInterval(draw, 15);
  setupCanvas();
}