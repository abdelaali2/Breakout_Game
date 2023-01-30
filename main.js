const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const FillColor = "black";
const DimmedColor = "rgba(0,0,0,0.2)";
const BallRadius = 20;
const BrickHeight = 50;
const StartButton = document.getElementById("Startbutton");
const BrickWidth = 210;
const BrickPadding = 30;
const PaddleWidth = 300;
const PaddleHeight = 40;
const BricksArray = [];
let BrickObject;
let RPressed = false;
let LPressed = false;
let PaddleX = (canvas.width - PaddleWidth) / 2;
let PaddleY = canvas.height - PaddleHeight;
let dx = 5;
let dy = 5;

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
  draw() { }
  move() { }
}

class Brick extends Shape {
  constructor({ position, Velocity, width, height }) {
    super({ position, Velocity, width, height });
    this.radii = 5;
    this.life = 2;
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
    if (this.life === 2) {
      context.fillStyle = FillColor;
      context.fill();
    } else if (this.life === 1) {
      context.fillStyle = DimmedColor;
      context.fill();
    }
    context.closePath();
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
    context.clearRect(0, 0, canvas.width, canvas.height);
    DrawBricks();
    if (
      GameBall.position.x + dx > canvas.width - BallRadius ||
      GameBall.position.x + dx < BallRadius
    ) {
      //console.log("inside first if x");
      dx = -dx;
    }
    if (GameBall.position.y + dy < BallRadius) {
      //console.log("inside first if y");
      dy = -dy;

    }
    else if (GameBall.position.y + dy > canvas.height - GamePaddle.height - GameBall.radius - 45) {
      //console.log(GamePaddle.position.y);
      //console.log("inside first else if x");
      if (GameBall.position.x >= PaddleX -BallRadius && GameBall.position.x <= PaddleX + PaddleWidth +BallRadius) {
        dy = -dy;
        GameBall.position.y -= dy;
      }
      else {
        // DrawCanvas();
        GameBall.position = { x: canvas.width / 2, y: canvas.height+25};
        GamePaddle.position = { x: PaddleX, y: PaddleY - 70 };
      }
    }
    GameBall.position.x += dx;
    GameBall.position.y += dy;
    GameBall.draw();
    GamePaddle.draw();
  }
}

let GameBall = new Ball({
  position: { x: canvas.width / 2, y: canvas.height - 400 - 80 },
  Velocity: { x: 0, y: 0 },
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
  }
  GameStart() {
    this.StartCountdownTimerID = setInterval(countdown, 970);
    if (!this.isON) {
      function countdown() {
        if (this.StartCountdown == 0) {
          isON = true;
          clearTimeout(this.StartCountdownTimerID);
        } else {
          this.StartCountdown--;
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
        const OverlapX =
          GameBall.position.x >= CurrentBrick.position.x - BallRadius &&
          GameBall.position.x >=
            CurrentBrick.position.x + BrickWidth + BallRadius;
        const OverlapY =
          GameBall.position.y >= CurrentBrick.position.y - BallRadius &&
          GameBall.position.y >=
            CurrentBrick.position.y + CurrentBrick.height + BallRadius;
        if (OverlapX && OverlapY) {
          //   dx = -dx;
          dy = -dy;
          CurrentBrick.life--;
        }
        // if (OverlapY) {
        //   CurrentBrick.life--;
        // }
      }
    }
  }
}

let Game = new Environment();

function GameMovement() {
//   Game.collisionDetection();
  GamePaddle.move();
  GameBall.move();
}

let testbrick = new Brick({
  position: { x: 100, y: 100 },
  Velocity: { x: 0, y: 0 },
  width: BrickWidth,
  height: BrickHeight,
  radii: 10,
});
testbrick.draw();

function DrawCanvas() {
  StartButton.addEventListener("click", Game.GameStart);

  GamePaddle.draw();
  //   Game.DrawBricks();
  GameBall.draw();
  setInterval(() => {
    GameMovement();
  }, 10);
}

DrawCanvas();
