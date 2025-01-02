let canvas = document.getElementById("canvasGame");
let ctx = canvas.getContext("2d");
let scoreOutputElement = document.getElementById("score-output");
let timerElement = document.getElementById("timer");
let scoreBoardElement = document.getElementById("scoreboard");
let timerContainerElement = document.getElementById("timer-container-id");

let uniform = 30;

let desiredWidth = 900 - uniform * 10;
let desiredHeight = 900 - uniform * 10;

ctx.canvas.width = desiredWidth - (desiredWidth % uniform);
ctx.canvas.height = desiredHeight - (desiredHeight % uniform);

let charPosX = 0;
let charPosY = 0;
let charSize = uniform;
let charMoveSpeed = 1;
let moveDirection = null;
let frameInterval = null;
let score = 0;

let range = 25;

let foodArray = [];
let foodSize = uniform;
let foodCount = 0;

let refreshSpeed = 1;
let gameTimer;

let additionalTime = 4000

// handles the default time for the timer //
let secondsTimer = 5000;

let moreTimeElement = document.getElementById("more-time-id");

function animateMoreTime() {
  timerContainerElement.removeChild(moreTimeElement);
  timerContainerElement.appendChild(moreTimeElement);

  moreTimeElement.style.animation = 'fadeOut 3s';
}

function initializeScore() {
  let initialArray = [];
  let initialScoreObj = {
    'time': `${new Date().toString().split(' ').slice(0, 5).join(' ')}`,
    'Attempt': 1,
    'Round': foodCount,
    'Score': scoreOutputElement.innerText
  }

  initialArray.push(initialScoreObj);
  localStorage.setItem('game_scores', JSON.stringify(initialArray));
}

function handleScore() {
  if(localStorage.getItem('game_scores') == null) {
    initializeScore();
  } else {
    let currentScores = JSON.parse(localStorage.getItem('game_scores'));

    console.log(currentScores);

    let newAttempt = currentScores.length + 1;

    let scoreObj = {
      'time': `${new Date().toString().split(' ').slice(0, 5).join(' ')}`,
      'Attempt': newAttempt,
      'Round': foodCount,
      'Score': scoreOutputElement.innerText
    }

    currentScores.unshift(scoreObj);

    localStorage.setItem('game_scores', JSON.stringify(currentScores));
  }
}

function drawCharacter(x, y) {
  ctx.fillStyle = "yellow";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.roundRect(x, y, charSize, charSize, 4);
  ctx.fill();
  ctx.beginPath();
  charPosX = x;
  charPosY = y;
}

function clearCanvas() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function handleCollision(collisionType) {
  switch (collisionType) {
    case 0:
      secondsTimer += additionalTime;
      timerElement.innerHTML = secondsTimer;
      animateMoreTime();
      playSound("moretime");
    case 3:
      playSound("hit_three");
    default:
      playSound("hit");
  }
}

function checkCollision() {
  for (let i = 0; i < foodArray.length; i++) {
    if (
      Math.abs(charPosX - foodArray[i][0]) <= range &&
      Math.abs(charPosY - foodArray[i][1]) <= range
    ) {
      score += foodArray[i][2];
      scoreOutputElement.innerHTML = score;
      handleCollision(foodArray[i][2]);
      foodArray.splice(i, 1);
    }
  }
}

function update(x, y) {
  clearCanvas();

  // handles cube going outside of the frame //
  x = x > ctx.canvas.width - charSize ? 0 : x;
  y = y > ctx.canvas.height - charSize ? 0 : y;
  x = x < 0 ? ctx.canvas.width - charSize : x;
  y = y < 0 ? ctx.canvas.height - charSize : y;

  drawCharacter(x, y);
  checkCollision();
  drawEatSpot();

  if (foodArray.length === 0) {
    charMoveSpeed += 0.4;
    secondsTimer += additionalTime;
    handleDrawFood();
    timerElement.innerHTML = secondsTimer;
    animateMoreTime();
  }
}

// handles the spawning of randomly weighted points //
function getWeightedRandom() {
  const weights = [
    { value: 0, weight: 0.06 }, // 6% chance for 0
    { value: 1, weight: 0.84 }, // 84% chance for 1
    { value: 2, weight: 0.06 }, // 6% chance for 2
    { value: 3, weight: 0.04 }, // 4% chance for 3
  ];

  const random = Math.random();
  let cumulative = 0;

  for (const item of weights) {
    cumulative += item.weight;
    if (random < cumulative) {
      return item.value;
    }
  }
}

function handleDrawFood() {
  foodCount = foodCount + 1;
  for (let i = 0; i < foodCount; i++) {
    let randomX =
      Math.floor((Math.random() * ctx.canvas.width) / charSize) * charSize;
    let randomY =
      Math.floor((Math.random() * ctx.canvas.height) / charSize) * charSize;
    let randomPoints = getWeightedRandom();
    foodArray.push([randomX, randomY, randomPoints]);
  }
  if (foodCount % 5 === 0) {
    playSound("inthezone");
  }
  document.getElementById("round-output").innerHTML = foodCount;
  drawEatSpot();
}

function displayScore() {
  console.log('this is called?')

  console.log(localStorage.getItem('game_scores') != null);

  if(localStorage.getItem('game_scores') != null) {
    let currentScores = JSON.parse(localStorage.getItem('game_scores'));

    currentScores.forEach((score) => {
      scoreBoardElement.innerHTML += `
      <li class="scoreboard-item">
        <p>Attempt: ${score.Attempt}</p>
        <p>Rounds: ${score.Round}</p>
        <p>Score: ${score.Score}</p>
        <p>${score.time}</p>
      </li>
      `
    });
  }
}

function initializeGame() {
  document.getElementById("timer").innerHTML = "Begin!";
  handleDrawFood();
  drawCharacter(charPosX, charPosY);
  displayScore();
}

function moveCharacter() {
  frameInterval = setInterval(() => {
    if (moveDirection === "LEFT") {
      update(charPosX - charMoveSpeed, charPosY);
    } else if (moveDirection === "DOWN") {
      update(charPosX, charPosY + charMoveSpeed);
    } else if (moveDirection === "RIGHT") {
      update(charPosX + charMoveSpeed, charPosY);
    } else if (moveDirection === "UP") {
      update(charPosX, charPosY - charMoveSpeed);
    }
  }, refreshSpeed);
}

window.addEventListener("keydown", (event) => {
  if (
    (event.keyCode === 37 || event.keyCode === 65) &&
    moveDirection !== "RIGHT" &&
    secondsTimer > -1
  ) {
    timer();
    clearInterval(frameInterval);
    moveDirection = "LEFT";
    moveCharacter();
  } else if (
    (event.keyCode === 38 || event.keyCode === 87) &&
    moveDirection !== "DOWN" &&
    secondsTimer > -1
  ) {
    timer();
    clearInterval(frameInterval);
    moveDirection = "UP";
    moveCharacter();
  } else if (
    (event.keyCode === 39 || event.keyCode === 68) &&
    moveDirection !== "LEFT" &&
    secondsTimer > -1
  ) {
    timer();
    clearInterval(frameInterval);
    moveDirection = "RIGHT";
    moveCharacter();
  } else if (
    (event.keyCode === 40 || event.keyCode === 83) &&
    moveDirection !== "UP" &&
    secondsTimer > -1
  ) {
    timer();
    clearInterval(frameInterval);
    moveDirection = "DOWN";
    moveCharacter();
  } else if (event.keyCode === 27) {
    clearInterval(gameTimer);
    clearInterval(frameInterval);
    moveDirection = "";
  }
});



function getFoodColor(foodType) {
  switch (foodType) {
    case 0:
      return "purple";
    case 1:
      return "Blue";
    case 2:
      return "Green";
    case 3:
      return "Red";
  }
}

function getFoodGlow(foodType) {
  switch (foodType) {
    case 0: // Purple
      return "rgba(128, 0, 128, 0.8)";
    case 1: // Blue
      return "rgba(0, 0, 255, 0.8)";
    case 2: // Green
      return "rgba(0, 255, 0, 0.8)";
    case 3: // Red
      return "rgba(255, 0, 0, 0.9)";
  }
}

function drawEatSpot() {
  for (let i = 0; i < foodArray.length; i++) {
    ctx.shadowColor = getFoodGlow(foodArray[i][2])
    ctx.shadowBlur = foodArray[i][2] !== 3 ? 20 : 15;
    ctx.fillStyle = "blue";
    ctx.fillStyle = getFoodColor(foodArray[i][2]);
    ctx.fillRect(foodArray[i][0], foodArray[i][1], foodSize, foodSize);
    ctx.fill();
  }
}

function timer() {
  if (moveDirection === null) {
    playBGMusic();
    gameTimer = setInterval(() => {
      let seconds = Math.floor(secondsTimer / 1000);
      let milliseconds = secondsTimer % 1000;

      timerElement.innerHTML = `${seconds}.${milliseconds.toString().padStart(3, "0")}`;

      secondsTimer -= 10;
      if (secondsTimer < 0) {
        playSound("gameover");
        clearInterval(gameTimer);
        moveDirection = "";
        handleScore();
        timerElement.innerHTML = "Game Over!";
        stopBGMusic();
        playGameOverMusic();
      }
    }, 10);
  }
}

initializeGame();
