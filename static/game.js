var socket = io();


//socket.emit('new player');
setInterval(function() {
  var my_progress = {
    progress: getProgress()
  }
  socket.emit('type', my_progress);
}, 1000 / 60);

socket.on('new_connection', function(players){
  console.log("a new person has connected")
  //console.log(players)
  var progress_bars = document.getElementById("progress_bars")
  progress_bars.innerHTML = ""
  for (var id in players) {
    var new_bar = document.createElement("PROGRESS")
    console.log(id)
    new_bar.setAttribute("id", id)
    new_bar.setAttribute("value", 0)
    new_bar.setAttribute("max", 100)
    progress_bars.appendChild(new_bar)
  }
});

socket.on('state', function(players) {
  //console.log(players)
  for (var id in players) {
    console.log("id: " + id)
    //console.log(players)
    if (players.hasOwnProperty(id)) {
      console.log(typeof(players[id]))
      console.log(players[id].player_progress)
      var player_progress_bar = document.getElementById(id)
      player_progress_bar.setAttribute("value", players[id].player_progress)
    }
    // console.log("players: ")
    // console.log(players)

  }
});

socket.on('player_disconnected',function(disconnectedID) {
  var toBeDeletedBar = document.getElementById(disconnectedID)
  toBeDeletedBar.remove()
});
