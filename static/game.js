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
  var colors = ["bg-success", "bg-info", "bg-warning", "bg-danger","bg-primary"]
  var counter = 0
  for (var id in players) {
    var outMostDiv = document.createElement("DIV")
    outMostDiv.setAttribute("class", "col-md-12")


    var outDiv = document.createElement("DIV")
    outDiv.setAttribute("class", "progress active mb-2")
    outDiv.setAttribute("style", "height: 35px")
    outMostDiv.appendChild(outDiv)


    var color = colors[counter]
    var classAttribute = "progress-bar progress-bar-striped pbar" + color
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
});


//RECEIVE FROM SERVER: update ALL player's progress bars
socket.on('state', function(players) {
//  console.log(players)
  //console.log(players)
  for (var id in players) {
//    console.log("id: " + id)
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
  console.log("before toBeDeletedBar")
  toBeDeletedBar.parentNode.parentNode.removeChild(toBeDeletedBar.parentNode)
//  toBeDeletedBar.remove()
  console.log("after toBeDeletedBar")
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
  var start = document.getElementById('start')
  var m = document.createElement("PARAGRAPH")
  m.innerHTML = message
  start.appendChild(m)
});


socket.on("gameStart", function (players){
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
  var distance = 5000 - curr;
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
