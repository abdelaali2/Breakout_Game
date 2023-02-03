const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const FillColor = "#F1D3B3";
const DimmedColor = "rgba(240, 233, 210,0.7)";
const BallRadius = 20;
const BrickHeight = 50;
const BrickWidth = 210;
const BrickPadding = 30;
const PaddleWidth = 300;
const PaddleHeight = 40;
const BricksArray = [];
const canvasRect = canvas.getBoundingClientRect();
const canvasRight = canvasRect.right;
const Score = document.getElementById("Score");
const Lives = document.getElementById("Lives");
const Gameover = document.getElementById("Gameover");
const StartButton = document.getElementById("Startbutton");
const GameoverImage = new Image();
const GameWinImage = new Image();
GameoverImage.src = "./Media/GG.jpeg";
GameWinImage.src = "./Media/Win.png";
let requestID;
let DestroyedBricks = 0;
let LivesCountDown = 3;
let RPressed = false;
let LPressed = false;
let PaddleX = (canvas.width - PaddleWidth) / 2;
let PaddleY = canvas.height - PaddleHeight;

class Event {
  constructor() {}
  KeyDown(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
      RPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
      LPressed = true;
    } else if (e.key == " " && GameBall.movesWithPaddle) {
      GameBall.Velocity = { x: 0, y: -10 };
      GameBall.movesWithPaddle = false;
    } else if (e.key == "Escape") {
      Game.GamePause();
    }
  }
  KeyUp(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
      RPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
      LPressed = false;
    } else if (e.key == " " && !Game.isON) {
      Game.GameStart();
    }
  }

  MouseHandler(e) {
    const mousePosition = e.screenX + e.offsetX - PaddleWidth * 0.85;
    if (
      mousePosition > 10 &&
      mousePosition < mousePosition + canvasRight - PaddleWidth
    ) {
      GamePaddle.position.x = mousePosition;
      if (GameBall.movesWithPaddle) {
        GameBall.position.x = mousePosition + PaddleWidth / 2;
      }
    }
  }

  mouseClickDown() {
    if (GameBall.movesWithPaddle) {
      GameBall.Velocity = { x: 0, y: -10 };
      GameBall.movesWithPaddle = false;
    }
  }

  mouseClickUp() {
    if (!Game.isON) {
      Game.GameStart();
    }
  }
}
let GameEvent = new Event();
document.addEventListener("keydown", GameEvent.KeyDown, false);
document.addEventListener("keyup", GameEvent.KeyUp, false);
document.addEventListener("mousemove", GameEvent.MouseHandler, false);
document.addEventListener("mousedown", GameEvent.mouseClickDown, false);
document.addEventListener("mouseup", GameEvent.mouseClickUp, false);

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
    this.life = 2;
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
    if (this.life === 2) {
      this.life--;
    } else if (this.life === 1) {
      this.life--;
      Game.score++;
      Score.innerText = `Score: ${Game.score}`;
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
    if (RPressed) {
      this.Velocity.x = 20;
      this.position.x += this.Velocity.x;
      const overRightLimit = this.position.x + PaddleWidth > canvas.width - 10;
      if (overRightLimit) {
        this.position.x = canvas.width - PaddleWidth - 20;
      }
    } else if (LPressed) {
      this.Velocity.x = -20;
      this.position.x += this.Velocity.x;
      const overLeftLimit = this.position.x < 10;
      if (overLeftLimit) {
        this.position.x = 20;
      }
    }
    this.draw();
  }
  reset() {
    this.position = { x: PaddleX, y: PaddleY - 70 };
    this.Velocity = { x: 0, y: 0 };
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
    this.movesWithPaddle = true;
  }
  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "#0095DD";
    context.fill();
    context.closePath();
  }
  move() {
    if (this.movesWithPaddle) {
      if (RPressed) {
        this.Velocity.x = 20;
        this.position.x += this.Velocity.x;
        const overRightLimit =
          this.position.x + PaddleWidth > canvas.width - 10;
        if (overRightLimit) {
          this.position.x = GamePaddle.position.x + PaddleWidth / 2;
        }
      } else if (LPressed) {
        this.Velocity.x = -20;
        this.position.x += this.Velocity.x;
        const overLeftLimit = this.position.x < 10 + PaddleWidth / 2;
        if (overLeftLimit) {
          this.position.x = GamePaddle.position.x + PaddleWidth / 2;
        }
      }
      this.draw();
    } else {
      if (
        this.position.x + this.Velocity.x > canvas.width - BallRadius ||
        this.position.x + this.Velocity.x < BallRadius
      ) {
        this.Velocity.x = -this.Velocity.x;
      }
      if (this.position.y + this.Velocity.y < BallRadius) {
        this.Velocity.y = -this.Velocity.y;
      } else if (
        this.position.y + this.Velocity.y >
        canvas.height - GamePaddle.height - this.radius - 45
      ) {
        if (
          this.position.x >= GamePaddle.position.x - BallRadius &&
          this.position.x <= GamePaddle.position.x + PaddleWidth + BallRadius
        ) {
          const collisionX = Math.abs(this.position.x - GamePaddle.position.x);
          const distanceToMiddle = collisionX - PaddleWidth / 2;
          this.Velocity.x = distanceToMiddle / 25;
          this.Velocity.y = -this.Velocity.y;
          this.position.y -= this.Velocity.y;
        } else {
          this.position = { x: canvas.width / 2, y: canvas.height + 25 };
          GamePaddle.position = { x: PaddleX, y: PaddleY - 70 };
          Game.decreaseLife();
          Lives.innerText = `Lives: ${Game.life}`;
        }
      } else if (this.position.y + this.Velocity.y > canvas.height) {
        alert("you hit rock bottom");
      }
      this.position.x += this.Velocity.x;
      this.position.y += this.Velocity.y;
      this.draw();
    }
  }
  reset() {
    this.position = {
      x: canvas.width / 2,
      y: canvas.height - PaddleHeight - BallRadius - 70,
    };
    this.Velocity = { x: 0, y: 0 };
    this.movesWithPaddle = true;
  }
}

let GameBall = new Ball({
  position: {
    x: canvas.width / 2,
    y: canvas.height - PaddleHeight - BallRadius - 70,
  },
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
  }

  controlButton() {
    if (StartButton.innerText === "Start") {
      Game.GameStart();
    } else if (
      StartButton.innerText === "Pause" ||
      StartButton.innerText === "Continue"
    ) {
      Game.GamePause();
    } else if (StartButton.innerText === "Play Again") {
      console.log("going to drawcanvas()")
      // DrawCanvas();
    }
  }

  GameStart() {
    let StartCountdown = 3;
    let StartCountdownTimerID;
    Game.isON = true;
    StartButton.innerText = `${StartCountdown}`;
    StartCountdownTimerID = setInterval(countdown, 970);
    function countdown() {
      if (StartCountdown == 1) {
        StartButton.innerText = "Pause";
        clearInterval(StartCountdownTimerID);
        GameMovement();
      } else {
        StartCountdown--;
        StartButton.innerText = `${StartCountdown}`;
      }
    }
  }

  GamePause() {
    if (StartButton.innerText === "Pause") {
      StartButton.innerText = "Continue";
      cancelAnimationFrame(requestID);
      canvas.style.backgroundColor = "rgb(0,0,0)";
      canvas.style.opacity = "0.5";
    } else if (StartButton.innerText === "Continue") {
      StartButton.innerText = "Pause";
      canvas.style.backgroundColor = "transparent";
      canvas.style.opacity = "1";
      GameMovement();
    }
  }

  GameOver() {
    this.DrawBricks();
    cancelAnimationFrame(requestID);
    GamePaddle.reset();
    GameBall.reset();
    this.isON = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(GameoverImage, 0, 0, canvas.width, canvas.height);
    StartButton.innerText = "Play Again";
    StartButton.style.lineHeight = "6.5em";
  }

  GameWin() {
    cancelAnimationFrame(requestID);
    GamePaddle.reset();
    GameBall.reset();
    this.isON = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(GameWinImage, 0, 0, canvas.width, canvas.height);
    StartButton.innerText = "Play Again";
    StartButton.style.lineHeight = "6.5em";
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
    BricksArray.forEach((row) => {
      row.forEach((CurrentBrick) => {
        // let CurrentBrick = testbrick;
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
          if (BallBrickOverlapX || BallBrickOverlapY) {
            if (
              GameBall.position.x <=
                CurrentBrick.position.x +
                  GameBall.Velocity.x -
                  2 * BallRadius ||
              GameBall.position.x >=
                CurrentBrick.position.x + GameBall.Velocity.x + BrickWidth
            ) {
              GameBall.Velocity.x = -GameBall.Velocity.x;
            } else {
              GameBall.Velocity.y = -GameBall.Velocity.y;
            }
            CurrentBrick.decreaseLife();
          }
          if (this.score === 12 * 5) {
            this.GameWin();
            console.log("you win");
          }
        }
      });
    });
  }
  decreaseLife() {
    if (this.life) {
      this.life--;
      GameBall.reset();
      GamePaddle.reset();
    } else {
      this.GameOver();
    }
  }
}

let Game = new Environment();
function GameMovement() {
  if (Game.isON) {
    requestID = requestAnimationFrame(GameMovement);
  } else {
    return;
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  Game.collisionDetection();
  GamePaddle.move();
  GameBall.move();
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
  cancelAnimationFrame(requestID);
  Game.DrawBricks();
  GamePaddle.draw();
  GameBall.draw();
  if (StartButton.innerText === "Play Again") {
    Game.score = 0;
    alert("score reset")
    Game.life = 3;
    Lives.innerText = `Lives: ${Game.life}`;
    Game.GameStart();
  }
}
StartButton.addEventListener("click", Game.controlButton);
DrawCanvas();
