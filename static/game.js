var socket = io();
socket.on('message', function(data) {
  console.log(data);
});

var movement = {
  up: false,
  down: false,
  left: false,
  right: false
}
document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});

socket.emit('new player');
setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

socket.on('connection', function(players) {
  var new_bar = document.createElement("PROGRESS")
  new_bar.setAttribute("value", player_progress)
  new_bar.setAttribute("max", 100)
  var progress_bars = document.getElementById("progress_bars")
  progress_bars.appendChild(new_bar)
});
socket.on('state', function(players) {
  for (var id in players) {

  }
  console.log("here")

});
