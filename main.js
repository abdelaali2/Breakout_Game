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
const Score = document.getElementById("Score");
const Lives = document.getElementById("Lives");
const Gameover = document.getElementById("Gameover");
const rangeValue = document.getElementById("rangeValue");
const MuteButton = document.getElementById("MuteButton");
const GameSpeedSlider = document.getElementById("GameSpeedSlider");
const MuteImage = new Image(50, 50);
MuteImage.src = "./Media/unmutelogo.png";
MuteButton.appendChild(MuteImage);
const StartButton = document.getElementById("Startbutton");
const GameoverImage = new Image();
GameoverImage.src = "./Media/gameover.png";
const GameWinImage = new Image();
GameWinImage.src = "./Media/Win.png";
const GameStartSound = new Audio(); //
GameStartSound.src = "./Media/GamesStart.wav";
const GameOverSound = new Audio(); //
GameOverSound.src = "./Media/GameOver.wav";
const GameWinSound = new Audio(); //
GameWinSound.src = "./Media/GameWin.wav";
const BallBrickSound = new Audio();
BallBrickSound.src = "./Media/BallBrickSound.wav";
const BallPaddleSound = new Audio();
BallPaddleSound.src = "./Media/BallPaddleSound.wav";
const ContinueSound = new Audio(); //
ContinueSound.src = "./Media/Continue.wav";
const PauseSound = new Audio(); //
PauseSound.src = "./Media/Pause.wav";
const ResetSound = new Audio();
ResetSound.src = "./Media/Reset.wav";
const SoundPlaylist = [];
const Instructions = [];
let requestID;
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
      BallPaddleSound.play();
      GameBall.Velocity = { x: 0, y: -Game.SpeedValue };
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
    } else if (e.key == "m" || e.key == "M") {
      GameEvent.MuteClicked();
    }
  }

  MouseHandler(e) {
    const mousePosition = e.screenX + e.offsetX - PaddleWidth * 0.85;
    GamePaddle.position.x = mousePosition;
    if (GameBall.movesWithPaddle) {
      GameBall.position.x = mousePosition + PaddleWidth / 2;
    }
  }

  mouseClickDown() {
    if (GameBall.movesWithPaddle) {
      BallPaddleSound.play();
      GameBall.Velocity = { x: 0, y: Game.SpeedValue };
      GameBall.movesWithPaddle = false;
    }
  }

  mouseClickUp() {
    if (!Game.isON) {
      Game.GameStart();
    }
  }

  MuteClicked() {
    if (!Game.isMuted) {
      Game.isMuted = true;
      MuteImage.src = "./Media/mutelogo.png";
      SoundPlaylist.forEach((sound) => {
        sound.muted = true;
      });
    } else {
      Game.isMuted = false;
      MuteImage.src = "./Media/unmutelogo.png";
      SoundPlaylist.forEach((sound) => {
        sound.muted = false;
      });
    }
  }
}

let GameEvent = new Event();
document.addEventListener("keydown", GameEvent.KeyDown, false);
document.addEventListener("keyup", GameEvent.KeyUp, false);
canvas.addEventListener("mousemove", GameEvent.MouseHandler, false);
canvas.addEventListener("mousedown", GameEvent.mouseClickDown, false);
canvas.addEventListener("mouseup", GameEvent.mouseClickUp, false);
MuteButton.addEventListener("click", GameEvent.MuteClicked, false);
StartButton.addEventListener("click", Game.controlButton, false);

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
    this.CornerRadius = 5;
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
        this.CornerRadius
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
        this.CornerRadius
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
    this.CornerRadius = 10;
  }
  draw() {
    context.beginPath();
    context.roundRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height,
      this.CornerRadius
    );
    context.fillStyle = "#f42279";
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
          BallPaddleSound.play();
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
        // } else if (this.position.y + this.Velocity.y > canvas.height) {
        //   alert("you hit rock bottom");
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
    this.isMuted = false;
    this.SpeedValue = GameSpeedSlider.value;
  }

  AdjustEnvironmentArrays() {
    Instructions.push(`Use the slider to set game difficulty`);
    Instructions.push(`Press [____] or 🖱️ click to Start`);
    Instructions.push(`Use ⇔ or 🖱️ to control paddle`);
    Instructions.push(`Press "ESC" to Pause`);
    Instructions.push(`Press "M" to Mute`);
    SoundPlaylist.push(GameStartSound);
    SoundPlaylist.push(GameOverSound);
    SoundPlaylist.push(GameWinSound);
    SoundPlaylist.push(BallBrickSound);
    SoundPlaylist.push(BallPaddleSound);
    SoundPlaylist.push(ContinueSound);
    SoundPlaylist.push(PauseSound);
    SoundPlaylist.push(ResetSound);
  }

  DrawInstructions() {
    canvas.style.backgroundColor = "rgba(0,0,0,0.5)";
    context.font = `bolder 100px "Courier New", Courier, monospace`;
    context.textAlign = "center";
    context.fillStyle = "#f42279";
    context.strokeStyle = "white";
    context.lineWidth = 2;
    Instructions.forEach((line, index) => {
      context.strokeText(line, canvas.width / 2, index * 170 + 220);
      context.fillText(line, canvas.width / 2, index * 170 + 220);
    });
  }

  setGameSpeed(GameSpeed) {
    Game.SpeedValue = GameSpeed;
    if (GameSpeed >= 10 && GameSpeed <= 25) {
      rangeValue.innerHTML = "Easy";
    } else if (GameSpeed > 25 && GameSpeed <= 42) {
      rangeValue.innerHTML = "Medium";
    } else if (GameSpeed > 42) {
      rangeValue.innerHTML = "Hard";
    }
    GameSpeedSlider.blur();
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
      DrawCanvas();
    }
  }

  GameStart() {
    GameStartSound.play();
    let StartCountdown = 3;
    let StartCountdownTimerID;
    Game.isON = true;
    StartButton.innerText = `${StartCountdown}`;
    StartButton.style.lineHeight = "4.8em";
    StartCountdownTimerID = setInterval(countdown, 970);
    function countdown() {
      if (StartCountdown == 1) {
        StartButton.innerText = "Pause";
        clearInterval(StartCountdownTimerID);
        canvas.style.backgroundColor = "rgba(0,0,0,0.1)";
        DrawCanvas();
        GameMovement();
      } else {
        StartCountdown--;
        StartButton.innerText = `${StartCountdown}`;
      }
    }
  }

  GamePause() {
    if (StartButton.innerText === "Pause") {
      PauseSound.play();
      StartButton.innerText = "Continue";
      StartButton.style.lineHeight = "5em";
      StartButton.style.fontSize = "1.4rem";
      cancelAnimationFrame(requestID);
      canvas.style.backgroundColor = "rgba(0,0,0,0.5)";
    } else if (StartButton.innerText === "Continue") {
      ContinueSound.play();
      StartButton.innerText = "Pause";
      StartButton.style.lineHeight = "5em";
      canvas.style.backgroundColor = "rgba(0,0,0,0.1)";
      GameMovement();
    }
  }

  GameOver() {
    GameOverSound.play();
    cancelAnimationFrame(requestID);
    this.isON = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.backgroundColor = "rgba(0,0,0,0.5)";
    context.drawImage(GameoverImage, 0, 0, canvas.width, canvas.height);
    StartButton.innerText = "Play Again";
    StartButton.style.lineHeight = "2.25em";
  }

  GameWin() {
    cancelAnimationFrame(requestID);
    GameWinSound.play();
    GamePaddle.reset();
    GameBall.reset();
    this.isON = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.backgroundColor = "rgba(0,0,0,0.5)";
    context.drawImage(GameWinImage, 0, 0, canvas.width, canvas.height);
    StartButton.innerText = "Play Again";
    StartButton.style.lineHeight = "6.5em";
  }

  DrawBricks() {
    for (let j = 0; j < 11; j++) {
      BricksArray[j] = [];
      for (let i = 0; i < 5; i++) {
        const BrickX = j * (BrickWidth + BrickPadding) + 25;
        const BrickY = i * (BrickHeight + BrickPadding) + 10;
        BricksArray[j][i] = new Brick({
          position: { x: BrickX, y: BrickY },
          Velocity: { x: 0, y: 0 },
          width: BrickWidth,
          height: BrickHeight,
          CornerRadius: 10,
        });
        BricksArray[j][i].draw();
      }
    }
  }

  collisionDetection() {
    BricksArray.forEach((row) => {
      row.forEach((CurrentBrick) => {
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
            BallBrickSound.play();
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
          if (this.score === 11 * 5) {
            this.GameWin();
          }
        }
      });
    });
  }
  decreaseLife() {
    if (this.life) {
      this.life--;
      ResetSound.play();
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

function DrawCanvas() {
  cancelAnimationFrame(requestID);
  if (StartButton.innerText === "Play Again") {
    Game.score = 0;
    canvas.style.background = "rgba(0, 0, 0, 0.1)";
    Score.innerText = `Score: ${Game.score}`;
    Game.life = 3;
    Lives.innerText = `Lives: ${Game.life}`;
    context.clearRect(0, 0, canvas.width, canvas.height);
    GamePaddle.reset();
    GameBall.reset();
    GamePaddle.draw();
    GameBall.draw();
    Game.DrawBricks();
    Game.GameStart();
  } else {
    Game.DrawBricks();
    GamePaddle.draw();
    GameBall.draw();
 }
}

window.addEventListener("load", () => {
  Game.setGameSpeed(Game.SpeedValue);
  Game.AdjustEnvironmentArrays();
  Game.DrawInstructions();
});
