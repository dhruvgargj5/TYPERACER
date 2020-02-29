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
}
