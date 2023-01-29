const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const FillColor = "black";
const BallRadius = 30;
const BrickHeight = 50;
const StartButton = document.getElementById("Startbutton");
const BrickWidth = 210;
const PaddleWidth = 300;
const PaddleHeight = 40;
let RPressed = false;
let LPressed = false;
let PaddleX = (canvas.width - PaddleWidth) / 2;
let PaddleY = (canvas.height - PaddleHeight);
let dx = 5;
let dy = 5;
let BricksArray;

document.addEventListener("keydown", KeyDown, false);
document.addEventListener("keyup", KeyUp, false);
function KeyDown(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    RPressed = true;
  }
  else if (e.key == "Left" || e.key == "ArrowLeft") {
    LPressed = true;
  }
}
function KeyUp(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    RPressed = false;
  }
  else if (e.key == "Left" || e.key == "ArrowLeft") {
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
    this.life = 1;
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
    context.fillStyle = FillColor;
    context.fill();
    context.closePath();
  }
}

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
  move()
  {
    context.clearRect(0, 0, canvas.width, canvas.height);
  DrawTiles();
  if (
    GameBall.position.x + dx > canvas.width - BallRadius ||
    GameBall.position.x + dx < BallRadius
  ) {
    dx = -dx;
  }
  if (
    GameBall.position.y + dy > canvas.height - BallRadius ||
    GameBall.position.y + dy < BallRadius
  ) {
    dy = -dy;
  }
  GameBall.position.x += dx;
  GameBall.position.y += dy;
  GameBall.draw();
  GamePaddle.draw();

  }
}

let GameBall = new Ball({
  position: { x: canvas.width / 2, y: canvas.height - 80 },
  Velocity: { x: 0, y: 0 },
  width: undefined,
  height: undefined,
  radius: BallRadius,
});

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
  move()
  {
    if (RPressed) {
      console.log("you pressed right");
      PaddleX += 7;
      GamePaddle.position.x = PaddleX;
      console.log(PaddleX);
      if (PaddleX + PaddleWidth > canvas.width - 10) {
        PaddleX = canvas.width - PaddleWidth - 20;
      }
    }
    else if (LPressed) {
      console.log("you pressed left");
      console.log(PaddleX);
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

function GameMovment() {
 GamePaddle.move();
 GameBall.move();
}

function DrawCanvas() {
  GamePaddle.draw();
  DrawTiles();
  GameBall.draw();
  setInterval(() => {
    GameMovment();
  }, 10);
}

function DrawTiles() {
  for (let j = 20; j < 350; j++) {
    for (let i = 20; i < canvas.width;) {
      let BrickObject = new Brick({
        position: { x: i, y: j },
        Velocity: { x: 0, y: 0 },
        width: BrickWidth,
        height: BrickHeight,
        radii: 10,
      });
      BrickObject.draw();
      i += BrickWidth + 10;
    }
    j += BrickHeight + 30;
  }
}

DrawCanvas();
