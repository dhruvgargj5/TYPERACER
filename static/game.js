var socket = io();


//socket.emit('new player');
setInterval(function() {
  var my_progress = {
    progress: getProgress()
  }
  socket.emit('type', my_progress);
}, 1000 / 60);


//RECEIVE FROM SERVER: CREATES ALL PLAYER'S PROG bars

//Runs when the SERVER emits "new_connection" and the players object
//This iterates through the player's object and, via player ID, creates a
//progress bar for each player.
//The progress bar is as follows:
// outMostDiv -- > <div class = "col-mod-12">
// outDiv -- >       <div class = "progress active mb-2" style = "height: 35px">
// innerDiv -- >         <div class = "progress-bar progress-bar-striped pbar COLOR"
//                       id = "id" role = "progressbar" style = "width: 0%;">
//                       </div>
//                   </div>
//                 </div>
socket.on('new_connection', function(players){
  console.log("a new person has connected")
  //console.log(players)
  var progress_bars = document.getElementById("progress_bars")
  progress_bars.innerHTML = ""
  var colors = ["bg-success", "bg-info", "bg-warning", "bg-danger","bg-primary"]
  var counter = 0

  var whoisReady = document.getElementById("whoReady")
  whoisReady.innerHTML = ""
  for (var id in players) {
    if (players.hasOwnProperty(id)) {
      if (players[id].isPlaying) {
        var outMostDiv = document.createElement("DIV")
        outMostDiv.setAttribute("class", "col-md-12")


        var outDiv = document.createElement("DIV")
        outDiv.setAttribute("class", "progress active mb-2")
        outDiv.setAttribute("style", "height: 35px")
        outMostDiv.appendChild(outDiv)


        var color = colors[counter]
        var classAttribute = "progress-bar progress-bar-striped progress-bar-animated pbar " + color
        var innerDiv = document.createElement("DIV")
        innerDiv.setAttribute("id", id)
        innerDiv.setAttribute("class", classAttribute)
        innerDiv.setAttribute("role", "progressbar")
        innerDiv.setAttribute("style", "width: 0%;")
        innerDiv.innerHTML = String(id)
        outDiv.appendChild(innerDiv)
        progress_bars.appendChild(outMostDiv)
        counter = (counter + 1) % 5
      }
      if (players[id].isReady) {
        var message = "Player " + id + " is ready.<br>"
        whoisReady.innerHTML += message
      }
    }
}
});


//RECEIVE FROM SERVER: update ALL player's progress bars
socket.on('state', function(players) {
  //console.log(players)
  for (var id in players) {
    //console.log("id: " + id)
    //console.log(players)
    if (players.hasOwnProperty(id)) {
      // console.log(typeof(players[id]))
      // console.log(players[id].player_progress)
      var player_progress_bar = document.getElementById(id)
      // player_progress_bar.setAttribute("value", players[id].player_progress)
      var style = "width: " + String(players[id].player_progress) + "%"
       player_progress_bar.setAttribute("style", style)
    }
    // console.log("players: ")
    // console.log(players)

  }
});

//RECEIVE FROM SERVER: deleting a disconnected player's progress bar
socket.on('player_disconnected',function(disconnectedID) {
  var toBeDeletedBar = document.getElementById(disconnectedID)
  toBeDeletedBar.parentNode.parentNode.removeChild(toBeDeletedBar.parentNode)
  var start = document.getElementById('start')
  var m = document.createElement("PARAGRAPH")
  var message = "Player: " + disconnectedID + " has disconnected"
  console.log(message)
  m.innerHTML = message
  start.appendChild(m)
});

//Player ready from button
function buttonClick(){
  socket.emit('playerReady')
  console.log("someone clicked the button")
}

socket.on("otherPlayerReady", function(message) {
  var whoisReady = document.getElementById("whoReady")
  whoisReady.innerHTML += message
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
    startTimer()
    document.getElementById("in").removeAttribute('readonly')
  }
}, 1000);
}
