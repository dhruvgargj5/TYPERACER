var socket = io();


//socket.emit('new player');
setInterval(function() {
  var my_progress = {
    progress: getProgress()
  }
  socket.emit('type', my_progress);
}, 1000 / 60);


//RECEIVE FROM SERVER: CREATES ALL PLAYER'S PROG bars
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


//RECEIVE FROM SERVER: update ALL player's progress bars
socket.on('state', function(players) {
  //console.log(players)
  for (var id in players) {
//    console.log("id: " + id)
    //console.log(players)
    if (players.hasOwnProperty(id)) {
      // console.log(typeof(players[id]))
      // console.log(players[id].player_progress)
      var player_progress_bar = document.getElementById(id)
      player_progress_bar.setAttribute("value", players[id].player_progress)
    }
    // console.log("players: ")
    // console.log(players)

  }
});

//RECEIVE FROM SERVER: deleting a disconnected player's progress bar
socket.on('player_disconnected',function(disconnectedID) {
  var toBeDeletedBar = document.getElementById(disconnectedID)
  toBeDeletedBar.remove()
});

//Player ready from button
function buttonClick(){
  socket.emit('playerReady')
  console.log("someone clicked the button")
}

socket.on("otherPlayerReady", function(message) {
  var start = document.getElementById('start')
  var m = document.createElement("PARAGRAPH")
  m.innerHTML = message
  start.appendChild(m)
});


socket.on("gameStart", function (){
  console.log("game has started")
  startCountdown()
});


function startCountdown(){

  //credit W3 Schools

// Update the count down every 1 second
  var curr = 0
  var x = setInterval(function() {

  // Get today's date and time
  // Find the distance between now and the count down date
  console.log("pre loopin")
  var distance = 10000 - curr;
  curr += 1000


  // Time calculations for days, hours, minutes and seconds
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById("startTimer").innerHTML = "Start in: " + seconds + "s ";
  // If the count down is finished, write some text
  //start the GAME
  if (distance <= 0) {
    clearInterval(x);
    document.getElementById("startTimer").innerHTML = "GAME STARTED";
    document.getElementById("in").removeAttribute('readonly')

  }
  console.log("seconds: " + seconds)
  console.log("distance: " + distance)
  console.log("curr: " + curr)
}, 1000);
}
