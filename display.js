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
  let input = document.getElementById('input_text').innerHTML;
  if (evtKcode == 8) {
    log("FOUND A BACKSPACE");
    log(document.getElementById('input_text').innerHTML.substring(0, input.length - 1));
    document.getElementById('input_text').innerHTML = document.getElementById('input_text').innerHTML.substring(0, input.length - 1);
  }

}

function type(event) {
  // let target = event.currentTarget;
  // let tag = target.tagName;
  //^^what doe these do lol
  let char = event.which;
//  log("CHAR: " + char);
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
  // log ("COUNTER: " + counter);
  // log ("CORRECT TEXT: " + correct_text[correctTextCounter]);
  // log ("INPUT TEXT: " + input_text[counter]);
  if (correct_text[correctTextCounter] == input_text[counter])
  {
    log("T");
    document.getElementById('in').value = ''
    var cText = document.getElementById('correct_text');
    cText.style.color = 'blue';
  }
  else {
      log("F");
      correctTextCounter--;
      var cText = document.getElementById('correct_text');
      cText.style.color = 'red';
  }
}
