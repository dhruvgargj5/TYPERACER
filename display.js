let log = console.log;
var counter = 0;
var userCounter = 0;
var correctCounter = 0;
var incorrectCounter = 0;

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
    //GET RID OF RED HIGHLIGHTED CHARS
    log("FOUND A BACKSPACE");
    userCounter--;
  }
}
function type(event) {
  let char = event.which;
  let s = String.fromCharCode(char);
  //log(s);
  document.getElementById('input_text').innerHTML += s;
  compare(counter);
  counter++;
  userCounter++;
}

function compare(counter)
{
  var input_text = document.getElementById('input_text').innerHTML;
  var correct_text = "OOH WHOA OOH whoa, ooh whoa You know you love me, I know you care Just shout whenever and I'll be there You are my love, you are my heart And we will never, ever, ever be apart";
//log ("ALL OF CORRECT TEXT: " + correct_text);
  log ("COUNTER: " + counter);
  log ("CORRECT TEXT: " + correct_text[correctCounter]);
  log ("INPUT TEXT: " + input_text[counter]);
  log ("CORRECT TEXT COUNTER: " + correctCounter);
  if (correct_text[correctCounter] == input_text[counter])
  {
    log("T");
    //clears input space after every word
    if (input_text[counter] == " ")
    {
      document.getElementById('in').value = ''
    }
    // var cText = document.getElementById('correct_text');
    // cText.style.color = 'blue';
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

function correctHighlight(){
  var instance = new Mark(document.getElementById('correct_text'));
  //highlights correct words
  instance.unmark();
  instance.markRanges([{
    start : 0,
    length : correctCounter + 1
  }]);
}

function incorrectHighlight()
{
  var instance = new Mark(document.getElementById('correct_text'));
  //highlights correct words
  instance.markRanges([{
    start : correctCounter + 1,
    length : incorrectCounter + 1
  }], {className: 'markincorrect'});
}
