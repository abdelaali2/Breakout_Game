const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const FillColor = "#F1D3B3";
const DimmedColor = "rgba(240, 233, 210,0.7)"
const BallRadius = 20;
const BrickHeight = 50;
const StartButton = document.getElementById("Startbutton");
const BrickWidth = 210;
const BrickPadding = 30;
const PaddleWidth = 300;
const PaddleHeight = 40;
const BricksArray = [];
let RPressed = false;
let LPressed = false;
let PaddleX = (canvas.width - PaddleWidth) / 2;
let PaddleY = canvas.height - PaddleHeight;

document.addEventListener("keydown", KeyDown, false);
document.addEventListener("keyup", KeyUp, false);
function KeyDown(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    RPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    LPressed = true;
  }
}
function KeyUp(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    RPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    LPressed = false;
  }
}

class Shape {
  constructor({ position, Velocity, width, height }) {
    this.position = position;
    this.Velocity = Velocity;
    this.width = width;
    this.height = height;
  }
  draw() {}
  move() {}
}

class Brick extends Shape {
  constructor({ position, Velocity, width, height }) {
    super({ position, Velocity, width, height });
    this.radii = 5;
    this.life = 1;
  }
  draw() {
    if (this.life === 2) {
      context.beginPath();
      context.roundRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height,
        this.radii
      );
      context.fillStyle = FillColor;
      context.fill();
    } else if (this.life === 1) {
      context.beginPath();
      context.roundRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height,
        this.radii
      );
      context.fillStyle = DimmedColor;
      context.fill();
    }
    context.closePath();
  }
  decreaseLife() {
    if (this.life) {
      this.life--;
    }
  }
}

class Paddle extends Shape {
  constructor({ position, Velocity, width, height }) {
    super({ position, Velocity, width, height });
    this.radii = 10;
  }
  draw() {
    context.beginPath();
    context.roundRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height,
      this.radii
    );
    context.fillStyle = "red";
    context.fill();
    context.closePath();
  }
  move() {
    if (Game.isON) {
    }
    if (RPressed) {
      PaddleX += 7;
      GamePaddle.position.x = PaddleX;
      if (PaddleX + PaddleWidth > canvas.width - 10) {
        PaddleX = canvas.width - PaddleWidth - 20;
      }
    } else if (LPressed) {
      PaddleX -= 7;
      GamePaddle.position.x = PaddleX;
      if (PaddleX < 10) {
        PaddleX = 20;
      }
    }
    GameBall.draw();
    GamePaddle.draw();
  }
}

let GamePaddle = new Paddle({
  position: { x: PaddleX, y: PaddleY - 70 },
  Velocity: { x: 0, y: 0 },
  width: PaddleWidth,
  height: PaddleHeight,
});
class Ball extends Shape {
  constructor({ position, Velocity, width, height, radius }) {
    super({ position, Velocity, width, height });
    this.radius = radius;
  }
  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "#0095DD";
    context.fill();
    context.closePath();
  }
  move() {
    if (
      GameBall.position.x + GameBall.Velocity.x > canvas.width - BallRadius ||
      GameBall.position.x + GameBall.Velocity.x < BallRadius
    ) {
      GameBall.Velocity.x = -GameBall.Velocity.x;
    }
    if (GameBall.position.y + GameBall.Velocity.y < BallRadius) {
      GameBall.Velocity.y = -GameBall.Velocity.y;
    } else if (
      GameBall.position.y + GameBall.Velocity.y >
      canvas.height - GamePaddle.height - GameBall.radius - 45
    ) {
      if (
        GameBall.position.x >= PaddleX - BallRadius &&
        GameBall.position.x <= PaddleX + PaddleWidth + BallRadius
      ) {
        const collisonX = Math.abs(GameBall.position.x - GamePaddle.position.x);
        const distanceToMiddle = collisonX - PaddleWidth / 2;
        GameBall.Velocity.x = distanceToMiddle / 32;
        GameBall.Velocity.y = -GameBall.Velocity.y;
        GameBall.position.y -= GameBall.Velocity.y;
      } else {
        GameBall.position = { x: canvas.width / 2, y: canvas.height + 25 };
        GamePaddle.position = { x: PaddleX, y: PaddleY - 70 };
      }
    } else if (GameBall.position.y + GameBall.Velocity.y > canvas.height){
      alert ("you hit rock bottom");
    }
    GameBall.position.x += GameBall.Velocity.x;
    GameBall.position.y += GameBall.Velocity.y;
    GameBall.draw();
    GamePaddle.draw();
  }
}

let GameBall = new Ball({
  position: { x: 1000, y: canvas.height - 450 },
  Velocity: { x: 5, y: 5 },
  width: undefined,
  height: undefined,
  radius: BallRadius,
});

class Environment {
  constructor() {
    this.life = 3;
    this.score = 0;
    this.isON = false;
    this.StartCountdown = 3;
    this.StartCountdownTimerID;
    this.requestID;
  }
  GameStart() {
    StartButton.innerText = this.StartCountdown;
    console.log(`in gamestart function ${this.StartCountdown}`);
    if (!this.isON) {
      console.log(`in first if function ${this.StartCountdown}`);
      this.StartCountdownTimerID = setInterval(countdown, 970);
      function countdown() {
        console.log(`in countdown function ${this.StartCountdown}`);
        if (this.StartCountdown == 0) {
          isON = true;
          clearTimeout(this.StartCountdownTimerID);
        } else {
          this.StartCountdown--;
          console.log(
            `in countdown function else condition${this.StartCountdown}`
          );
          StartButton.innerText = this.StartCountdown;
        }
      }
    }
  }
  GameOver() {
    console.log(this.score);
  }

  DrawBricks() {
    for (let j = 0; j < 12; j++) {
      BricksArray[j] = [];
      for (let i = 0; i < 5; i++) {
        const BrickX = j * (BrickWidth + BrickPadding) + 25;
        const BrickY = i * (BrickHeight + BrickPadding) + 10;
        BricksArray[j][i] = new Brick({
          position: { x: BrickX, y: BrickY },
          Velocity: { x: 0, y: 0 },
          width: BrickWidth,
          height: BrickHeight,
          radii: 10,
        });
        BricksArray[j][i].draw();
      }
    }
  }

  collisionDetection() {
    for (let j = 0; j < 12; j++) {
      for (let i = 0; i < 5; i++) {
        const CurrentBrick = BricksArray[j][i];
        CurrentBrick.draw();
        if (CurrentBrick.life) {
          const BallBrickOverlapX =
            GameBall.position.x >= CurrentBrick.position.x - BallRadius &&
            GameBall.position.x <=
              CurrentBrick.position.x + BrickWidth + BallRadius;
          const BallBrickOverlapY =
            GameBall.position.y >= CurrentBrick.position.y - BallRadius &&
            GameBall.position.y <=
              CurrentBrick.position.y + CurrentBrick.height + BallRadius;
          if (BallBrickOverlapX && BallBrickOverlapY) {
            if (
              GameBall.position.x === CurrentBrick.position.x - BallRadius ||
              GameBall.position.x ===
                CurrentBrick.position.x + BrickWidth + BallRadius
            ) {
              GameBall.Velocity.x = -GameBall.Velocity.x;
            } else if (
              GameBall.position.y === CurrentBrick.position.y - BallRadius ||
              GameBall.position.y ===
                CurrentBrick.position.y + CurrentBrick.height + BallRadius
            ) {
              GameBall.Velocity.y = -GameBall.Velocity.y;
            } else {
              GameBall.Velocity.y = -GameBall.Velocity.y;
              GameBall.Velocity.x = -GameBall.Velocity.x;
            }
            CurrentBrick.decreaseLife();
          }
        }
      }
    }
  }
}

let Game = new Environment();

function GameMovement() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  Game.collisionDetection();
  GamePaddle.move();
  GameBall.move();
  Game.requestID = requestAnimationFrame(GameMovement);
  // return;
}

let testbrick = new Brick({
  position: { x: canvas.width / 2, y: canvas.height / 2 },
  Velocity: { x: 0, y: 0 },
  width: BrickWidth,
  height: BrickHeight,
  radii: 10,
});

// testbrick.draw();

function DrawCanvas() {
  StartButton.addEventListener("click", Game.GameStart);
  cancelAnimationFrame(Game.requestID);
  Game.DrawBricks();
  GamePaddle.draw();
  GameBall.draw();
  // Game.GameStart();
  // setInterval(() => {
  GameMovement();
  // }, 10);
}

DrawCanvas();
