let bgMusic = new Audio('music/bgMusic.mp3');
let gameOverBGMusic = new Audio('music/gameoverBGMusic.mp3');

function playSound(sound) {
  let audio;
  switch (sound) {
    case 'hit':
      audio = new Audio('sounds/hit.mp3');
      break;
    case 'hit_three':
      audio = new Audio('sounds/hit_three.mp3');
      break;
    case 'gameover':
      audio = new Audio('sounds/gameover.mp3');
      break;
    case 'moretime':
      audio = new Audio('sounds/moretime.mp3');
      break;
    case 'inthezone':
      audio = new Audio('sounds/inthezone.mp3');
      break;
  }

  // Play the new audio instance
  // this allows multiple instances of the audio to play
  if (audio) {
    audio.play();
  }
}

function playBGMusic() {
  console.log("PLAY AUDIO")
  bgMusic.volume = 0.80;
  bgMusic.loop = true;
  bgMusic.play();
}

function stopBGMusic() {
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

function playGameOverMusic() {
  gameOverBGMusic.volume = 0.80;
  gameOverBGMusic.play();
}
