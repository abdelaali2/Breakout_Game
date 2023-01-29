const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const FillColor = "black";
const BallRadius = 30;
const BrickHeight = 50;
const BrickWidth = 210;
const PaddleWidth = 300;
const PaddleHeight = 40;
let dx = 5;
let dy = 5;
let BricksArray;

class Shape {
  constructor({ position, Velocity, width, height }) {
    this.position = position;
    this.Velocity = Velocity;
    this.width = width;
    this.height = height;
  }
  draw() { }
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
    // this.position.x += moveX;
    // this.position.x += moveY;
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "#0095DD";
    context.fill();
    context.closePath();
    // context.beginPath();
    // context.fill();
    // context.closePath();
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
}

let GamePaddle = new Paddle({
  position: { x: canvas.width / 2, y: canvas.height - 70 },
  Velocity: { x: 0, y: 0 },
  width: PaddleWidth,
  height: PaddleHeight,
});

function DrawCanvas() {
  GamePaddle.draw();
  DrawTiles();
  GameBall.draw();
  setInterval(() => {
    UpdateBallPosition();
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

function UpdateBallPosition() {
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

// Initiating the game

DrawCanvas();
