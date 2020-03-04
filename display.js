let log = console.log;
var counter = 0;
var correctTextCounter = 0;
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
    log("FOUND A BACKSPACE");

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
  var input_text = document.getElementById('input_text').innerHTML;
  var correct_text = "OOH WHOA OOH whoa, ooh whoa You know you love me, I know you care Just shout whenever and I'll be there You are my love, you are my heart And we will never, ever, ever be apart";
//log ("ALL OF CORRECT TEXT: " + correct_text);
  log ("COUNTER: " + counter);
  log ("CORRECT TEXT: " + correct_text[correctTextCounter]);
  log ("INPUT TEXT: " + input_text[counter]);
  log ("CORRECT TEXT COUNTER: " + correctTextCounter);
  if (correct_text[correctTextCounter] == input_text[counter])
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
    incorrectCounter = 0;
  }
  else {
      log("F");
      correctTextCounter--;
      incorrectCounter++;
    //  incorrectHighlight();
  }
}

function correctHighlight(){
  var instance = new Mark(document.getElementById('correct_text'));
  //highlights correct words
  instance.unmark();
  instance.markRanges([{
    start : 0,
    length : correctTextCounter + 1
  }]);
}

function incorrectHighlight()
{
  var instance = new Mark(document.getElementById('correct_text'));
  //highlights correct words
  instance.markRanges([{
    start : correctTextCounter,
    length : incorrectCounter + 1
  }], {className: 'markincorrect'});
}
