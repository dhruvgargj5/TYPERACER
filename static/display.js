let log = console.log;
var counter = 0;
var userCounter = 0;
var correctCounter = 0;
var incorrectCounter = 0;
var input_text = "";
//var startedTimer = false;
var correct_text = "Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense."

var isWin = false;
var isOver = false;

var progress = 0;

document.addEventListener("DOMContentLoaded", init);
function init() {
    let txt = document.getElementById('in');
    txt.addEventListener('keypress', type);
    txt.addEventListener('keydown', backspace);
  /*
    used to be keydown. making it keypress fixes shift and case problem.
    see Google Doc for explanation
  */
}

function backspace(event)
{
  if(!document.getElementById('in').hasAttribute('readonly')){
  var evtKcode = event.keyCode;
  if (evtKcode == 8)
  {
    //GET RID OF RED HIGHLIGHTED CHARS
    log("FOUND A BACKSPACE");
    incorrectCounter--;
    incorrectHighlight();
    userCounter--;
  }

  if (evtKcode == 13)
  {
    log ("ENTER");
    if (correctCounter == correct_text.length)
    {
      log("WIN");
      isWin = true;
    }
  }
}
}
function type(event) {
  if(!document.getElementById('in').hasAttribute('readonly')){
  let char = event.which;
  let s = String.fromCharCode(char);

  input_text += s;
  compare(counter);
  counter++;
  userCounter++;
  // if (!startedTimer)
  // {
  //   startTimer();
  //   startedTimer = true;
  // }
  updateProgress();
  update_wpm();
}
}

function updateProgress() {
  progress = (correctCounter / correct_text.length) * 100;
}

function getProgress() {
  return progress;
}

function compare(counter)
{

//  log ("CORRECT TEXT LENGTH: " + correct_text.length)
  // log ("CORRECT TEXT: " + correct_text[correctCounter]);
  // log ("INPUT TEXT: " + input_text[counter]);
  //log ("CORRECT TEXT COUNTER: " + correctCounter);
  // log ("INCORRECT COUNTER: " + incorrectCounter);

  //incorrectCounter <= 0 means you can abuse the backspace
  if (!isOver && !isWin) {
    if (correct_text[correctCounter] == input_text[counter] && incorrectCounter <= 0)
    {
      log("T");
      //clears input space after every word
      if (input_text[counter] == " ")
      {
        document.getElementById('in').value = ''
      }
      correctHighlight();
      correctCounter++;
      incorrectCounter = 0;
    }
    else {
        log("F");
        incorrectCounter++;
        incorrectHighlight();
    }
  }
}

function correctHighlight(value=0){
  var instance = new Mark(document.getElementById('correct_text'));
  //highlights correct words
  instance.unmark();
  instance.markRanges([{
    start : 0,
    length : correctCounter + 1 + value
  }]);
}

function incorrectHighlight()
{
  var instance = new Mark(document.getElementById('correct_text'));
  //highlights correct words
  instance.unmark();
  correctHighlight(-1);
  instance.markRanges([{
    start : correctCounter,
    length : incorrectCounter
  }], {className: 'markincorrect'});
}

function update_wpm() {
  let words = correctCounter / 5;
  let time = timePassed / 60;
  let wpm = Math.floor(words / time);
  if (correctCounter >= 10 && correctCounter % 3 == 0) {
      document.getElementById("wpm").innerHTML = "wpm: " + String(wpm);
  }
  if (correctCounter == correct_text.length) {
    document.getElementById("wpm").innerHTML = "wpm: " + String(wpm);
  }
}

// Credit: Mateusz Rybczonec

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;


const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

const TIME_LIMIT = 60;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;


document.getElementById("app").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
    timeLeft
  )}</span>
</div>
`;

function onTimesUp() {
  clearInterval(timerInterval);
}

function startTimer() {
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    document.getElementById("base-timer-label").innerHTML = formatTime(
      timeLeft
    );
    setCircleDasharray();
    setRemainingPathColor(timeLeft);
    if (timeLeft == 0) {
      isOver = true;
    }
    if (isOver || isWin) {
      document.getElementById("in").readOnly = true;
      onTimesUp();
    }
  }, 1000);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  }
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}
