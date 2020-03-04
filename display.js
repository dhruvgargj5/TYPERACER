let log = console.log;
var counter = 0;
var correctTextCounter = 0;

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
  var evtKcode = event.keyCode;
  if (evtKcode == 8)
  {
    log("FOUND A BACKSPACE");
      correctTextCounter--;
  }
}

function type(event) {
  let target = event.currentTarget;
  let tag = target.tagName;
  let char = event.which;
  log("CHAR: " + char);
  let s = String.fromCharCode(char);
  //log(s);
  // add if statements to check if it's a backspace (if it is delete a char)
  document.getElementById('input_text').innerHTML += s;
  compare(counter);
  counter++;
  correctTextCounter++;
}

function compare(counter)
{
  var correct_text = document.getElementById('correct_text').innerHTML;
  var input_text = document.getElementById('input_text').innerHTML;
  log ("COUNTER: " + counter);
  log ("CORRECT TEXT: " + correct_text[correctTextCounter]);
  log ("INPUT TEXT: " + input_text[counter]);
  if (correct_text[correctTextCounter] == input_text[counter])
  {
    log("T");
  }
  else {

      log("F");
  }
}
