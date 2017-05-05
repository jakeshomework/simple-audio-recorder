//original >> https://codepen.io/cathydutton/pen/GBcvo/
//https://codepen.io/anon/pen/RVLGbz
//also see here: https://gist.github.com/ddallala/325209

// <p><span id="seconds">00</span>:<span id="tens">00</span></p>
// <button id="button-start">Start</button>
// <button id="button-stop">Stop</button>
// <button id="button-reset">Reset</button>
// </div>

document.addEventListener("DOMContentLoaded", function() {
  appendTimer = document.getElementById("timer");
  writeMessage(defaultMessage);
});

var seconds = 00;
var tens = 00;
var minutes = 00;
var timer = '';
var Interval ;
var appendTimer ;
var defaultMessage = 'Click to begin recording'

function writeTimer(min, sec, tens) {
  var showTens = '';
  var showSeconds = '';
  var showMinutes = '';

  if (tens < 10){
    showTens = "0" + tens;
  } else showTens = tens;

  if (seconds < 10){
    showSeconds = "0" + seconds;
  } else showSeconds = seconds;

  if (minutes < 9){
    showMinutes = "0" + minutes;
  }
  timer = showMinutes + ":" + showSeconds + ":" + showTens;
  appendTimer.innerHTML = timer;
}

function writeMessage(message) {
  appendTimer.innerHTML = message;
}

function startTimer() {
   clearInterval(Interval);
   Interval = setInterval(countTime, 10);
}

function stopTimer() {
  clearInterval(Interval);
}

function zeroTimer() {
  clearInterval(Interval);
  tens = 0;
  seconds = 0;
  minutes = 0;
  writeMessage(defaultMessage);
}

function countTime () {
  tens++;

  if (tens > 99) {
    seconds++;
    tens = 0;
  }

  if (seconds > 59) {
    minutes++;
    seconds = 0;
  }

  writeTimer(minutes, seconds, tens);
}
