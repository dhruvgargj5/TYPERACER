let log = console.log;
var counter = 0;

document.addEventListener("DOMContentLoaded", init);

function init() {
  let txt = document.getElementById('in');
  txt.addEventListener('keypress', type);
  /*
    used to be keydown. making it keypress fixes shift and case problem.
    see Google Doc for explanation
  */

}

function type(event) {
  let target = event.currentTarget;
  let tag = target.tagName;
  let char = event.which;
  log("CHAR: " + char)  //subtract ascii value to get to lowercase
  let s = String.fromCharCode(char);
  //log(s);
  // add if statements to check if it's a backspace (if it is delete a char)
  document.getElementById('main_text').innerHTML += s;
  compare(counter);
  counter++;
}

function compare(counter)
{
  var correct_text = document.getElementById('correct_text').innerHTML;
  var input_text = document.getElementById('main_text').innerHTML;
  log ("COUNTER: " + counter);
  log ("CORRECT TEXT: " + correct_text[counter]);
  log ("INPUT TEXT: " + input_text[counter]);
  if (correct_text[counter] == input_text[counter])
  {
    log("T");
  }
  else {

      log("F");
  }
}
