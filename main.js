const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const Colors = ["red", "green", "blue"];
const FillColor = "black";
const BrickWidth = 107;
const BrickHeight = 50;

class Shape {
  constructor({ position, Velocity, width, height }) {
    this.position = position;
    this.Velocity = Velocity;
    this.width = width;
    this.height = height;
  }
  draw() {}
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
  constructor({ position, Velocity, width, height, radius}) {
    super({ position, Velocity, width, height });
    this.radius=radius;
  }
  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
    context.fillStyle = "#0095DD";
    context.fill();
    context.closePath();
    // context.beginPath();
    // context.fill();
    // context.closePath();
  }
}

function DrawCanvas() {
  DrawTiles();
  GameBall.draw();
}

function DrawTiles() {
  for (let j = 20; j < 350; j++) {
    for (let i = 20; i < canvas.width; ) {
      let BrickObject = new Brick({
        position: { x: i, y: j },
        Velocity: { x: 0, y: 0 },
        width: 107,
        height: 50,
        radii: 10,
      });
      BrickObject.draw();
      i += BrickWidth + 20;
    }
    j += BrickHeight + 30;
  }
}
// function DrawBall() {
  let GameBall = new Ball({
    position: { x: canvas.width/2, y: canvas.height-80 },
    Velocity: { x: 0, y: 0 },
    width: 150,
    height: 150,
    radius: 30
  });
//   GameBall.draw();
// }

// function GenerateBrickColor() {
//   return Colors[Math.floor(Math.random() * Colors.length)];
// }

  class Paddle extends Shape {
    constructor({ position, Velocity, width, height }) {
    super({ position, Velocity, width, height });
  }

  draw() {
    context.beginPath();
    context.rect(this.position.x, this.position.y, this.width, canvas.height-this.height);
    context.fillStyle = "red";
    context.fill();
    context.closePath();
}
}

let GamePaddle = new Paddle({
    position: { x: canvas.width/2, y: canvas.height-30},
    Velocity: { x: 0, y: 0 },
    width: 150,
    height: 150
  });
  GamePaddle.draw();

DrawCanvas();
setInterval(() => {
  DrawCanvas();
}, 10000);

