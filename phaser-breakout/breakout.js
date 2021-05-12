// https://stackabuse.com/introduction-to-phaser-3-building-breakout/

// https://learn.yorkcs.com/2019/02/26/creating-a-star-field-with-phaser-3/

let player, ball, violetBricks, yellowBricks, redBricks, cursors;
let openingText, gameOverText, playerWonText;
let gameStarted = false;

let ballAngleUpdate;

let points, stars, maxDepth;

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 640,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload, create, update,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: false
    },
  },
  //pixelArt: true,
  roundPixels: true,
};

function isGameOver(world) {
  return ball.body.y > world.bounds.height;
}
function isWon() {
  return violetBricks.countActive() + yellowBricks.countActive() + redBricks.countActive() === 0;
}
function hitBrick(ball, brick) {
  brick.disableBody(true, true);

  if (ball.body.velocity.x === 0) {
    randNum = Math.random();
    if (randNum >= 0.5)
      ball.body.setVelocityX(150);
    else
      ball.body.setVelocityX(-150);
  }
  ballAngleUpdate *= -1;
}

function hitPlayer(ball, player) {
  // increase velocity
  ball.setVelocityY(ball.body.velocity.y - 5);

  let newXVelocity = Math.abs(ball.body.velocity.x) + 5;
  if (ball.x < player.x) {
    ball.setVelocityX(-newXVelocity);
  } else {
    ball.setVelocityX(newXVelocity);
  }
  ballAngleUpdate *= -1;
}

const game = new Phaser.Game(config);

function preload() {
  this.load.image('ball', 'assets/images/ball_32_32.png');
  this.load.image('paddle', 'assets/images/paddle_128_32.png');
  this.load.image('brick1', 'assets/images/brick1_64_32.png');
  this.load.image('brick2', 'assets/images/brick2_64_32.png');
  this.load.image('brick3', 'assets/images/brick3_64_32.png');
}
function create() {
  // setup sprites
  player = this.physics.add.sprite(400, 600, 'paddle');
  ball = this.physics.add.sprite(400, 565, 'ball');

  ballAngleUpdate = 1;

  violetBricks = this.physics.add.group({
    key: 'brick1',
    repeat: 9,
    immovable: true,
    setXY: { x: 80, y: 140, stepX: 70 }
  });
  yellowBricks = this.physics.add.group({
    key: 'brick2',
    repeat: 9,
    immovable: true,
    setXY: { x: 80, y: 90, stepX: 70 }
  });
  redBricks = this.physics.add.group({
    key: 'brick3',
    repeat: 9,
    immovable: true,
    setXY: { x: 80, y: 40, stepX: 70 }
  });

  // inputs
  cursors = this.input.keyboard.createCursorKeys();

  // colliders
  player.setCollideWorldBounds(true);
  ball.setCollideWorldBounds(true);
  ball.setBounce(1, 1)
  this.physics.world.checkCollision.down = false;

  this.physics.add.collider(ball, violetBricks, hitBrick, null, this);
  this.physics.add.collider(ball, redBricks, hitBrick, null, this);
  this.physics.add.collider(ball, yellowBricks, hitBrick, null, this);

  player.setImmovable(true);
  this.physics.add.collider(ball, player, hitPlayer, null, this);

  // text
  openingText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    'Press SPACE to start',
    {
      fontFamily: 'Monaco, Courier, monospace',
      fontSize: '50px',
      fill: '#fff'
    }
  );
  openingText.setOrigin(0.5);

  gameOverText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    'GAME OVER',
    {
      fontFamily: 'Monaco, Courier, monospace',
      fontSize: '50px',
      fill: '#fff'
    }
  );
  gameOverText.setVisible(false);
  gameOverText.setOrigin(0.5);

  playerWonText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    'YOU WIN',
    {
      fontFamily: 'Monaco, Courier, monospace',
      fontSize: '50px',
      fill: '#fff'
    }
  );
  playerWonText.setVisible(false);
  playerWonText.setOrigin(0.5);

  // starfield
  points = [];
  stars = this.add.group();
  maxDepth = 32;
  for (let i = 0; i < 512; i++) {
    points.push({
      x: Phaser.Math.Between(-25, 25),
      y: Phaser.Math.Between(-25, 25),
      z: Phaser.Math.Between(1, maxDepth),
    });
  }
}

function update() {
  stars.clear(true, true);
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    point.z -= 0.2;

    if (point.z <= 0) {
      point.x = Phaser.Math.Between(-25, 25);
      point.y = Phaser.Math.Between(-25, 25);
      point.z = maxDepth;
    }

    let px = point.x * (128 / point.z) + (this.game.config.width * 0.5);
    let py = point.y * (128 / point.z) + (this.game.config.height * 0.5);
    let circle = new Phaser.Geom.Circle(
      px, py, (1 - point.z / 32) * 2
    );
    let graphics = this.add.graphics({ fillStyle: { color: 0xffffff } });
    graphics.setAlpha((1 - point.z / 32));
    graphics.fillCircleShape(circle);
    stars.add(graphics);
  }

  // did ball leave scene?
  if (isGameOver(this.physics.world)) {
    // game over
    gameOverText.setVisible(true);
    ball.disableBody(true, true);
  } else if (isWon()) {
    // win state
    playerWonText.setVisible(true);
    ball.disableBody(true, true);
  } else {
    // main game
    player.body.setVelocityX(0);

    if (!gameStarted) {
      ball.setX(player.x);

      if (cursors.space.isDown) {
        gameStarted = true;
        ball.setVelocityY(-200);
        openingText.setVisible(false);
      }
    } else {
      ball.angle += ballAngleUpdate;
      if (ball.angle > 360) ball.angle = 0;
      if (ball.angle < -360) ball.angle = 0;
    }
    if (cursors.left.isDown)
      player.body.setVelocityX(-350);
    else if (cursors.right.isDown) {
      player.body.setVelocityX(350);
    }

  }
}