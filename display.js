let log = console.log;

document.addEventListener("DOMContentLoaded", init);

function init() {
  let txt = document.getElementById('in');
  txt.addEventListener('keydown', type);
}

function type(event) {
  let target = event.currentTarget;
  let tag = target.tagName;
  let char = event.which;
  let s = String.fromCharCode(char);
  log(s);
  // add if statements to check if it's a backspace (if it is delete a char)
  document.getElementById('main_text').innerHTML += s
}
