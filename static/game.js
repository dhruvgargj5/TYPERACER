var socket = io();

var room;

socket.on('JoinedARoom', function(roomCode) {
  room = roomCode
  console.log(roomCode)
});

function readyBttnClick() {
  console.log("someone clicked the ready button")
  var namein = document.getElementById('name_in')
  var username = namein.value
  var readyUp = document.getElementById('readyButton')
  var errormessage = document.getElementById('name_feedback')
  if (username == "") {
    errormessage.setAttribute("class", "invalid-feedback")
    errormessage.innerHTML = "Please enter a name to continue"
    namein.setAttribute("class", "form-control is-invalid mr-sm-2")
  }
  if (username != "") {
    errormessage.setAttribute("class", "valid-feedback")
    namein.setAttribute("class", "form-control is-valid mr-sm-2")
    errormessage.innerHTML = "Looks good!"
    readyUp.remove()
    namein.remove()
    var message = document.createElement("H5")
    message.innerHTML = "Type fast " + username
    document.getElementById("nameSpace").appendChild(message)
    usernameAndRoom = [username, room]
    socket.emit("playerReady", usernameAndRoom)
    console.log("someone clicked the button")
  }
}












setInterval(function() {
  //gets the progress from display.js
  var my_progress = {
    progress: getProgress()
  }
  //emits the progess 60x/second
  socket.emit('progressUpdate', my_progress);
}, 1000 / 60);

//RECEIVE FROM SERVER: Creates new player's progress bars and gives the new
//player who is connected who all is ready

//Runs when the SERVER emits "new_connection" and the players object
//This iterates through the player's object and, via player ID, creates a
//progress bar for each player as well as printing who's ready
//The progress bar is as follows:
// outMostDiv -- > <div class = "col-mod-11">
// outDiv -- >       <div class = "progress active mb-2" style = "height: 35px">
// innerDiv -- >         <div class = "progress-bar progress-bar-striped pbar COLOR"
//                       id = "id" role = "progressbar" style = "width: 0%;">
//                       </div>
//                   </div>
//                 </div>
//RECEIVE FROM SERVER 60x/second: creates and updates ALL player's progress bars
//as well as their ready status

socket.on('state', function(gameState) {
  var players = gameState.players
  for (var id in players) {
    if (players.hasOwnProperty(id)) {
      //if player is ready, is playing, and they don't have a prog bar

      //progress_bars is the div that will contain all progress bars
      var progress_bars = document.getElementById("progress_bars")

      if (players[id].isReady && players[id].isPlaying &&
          (document.getElementById(id) == null)){
            //label for prog bar
            var label = document.createElement("PARAGRAPH")
            label.setAttribute("class", "col-md-1")
            label.setAttribute("id", id + "-tag")
            label.innerHTML = players[id].name

            //all progress bar content, breakdown of divs is above
            var outMostDiv = document.createElement("DIV")
            outMostDiv.setAttribute("class", "col-md-11")

            var outDiv = document.createElement("DIV")
            outDiv.setAttribute("class", "progress active mb-2")
            outDiv.setAttribute("style", "height: 35px")
            outMostDiv.appendChild(outDiv)
            var color = players[id].color
            var classAttribute = "progress-bar progress-bar-striped progress-bar-animated pbar " + color
            var innerDiv = document.createElement("DIV")
            innerDiv.setAttribute("id", id)
            innerDiv.setAttribute("class", classAttribute)
            innerDiv.setAttribute("role", "progressbar")
            innerDiv.setAttribute("style", "width: 0%;")
            outDiv.appendChild(innerDiv)
            progress_bars.appendChild(label)
            progress_bars.appendChild(outMostDiv)

          }

      var player_progress_bar = document.getElementById(id)
      //updates progress bar
      if (gameState.hasStarted && player_progress_bar != null){
        var progressBarStyle = "width: " + String(players[id].player_progress) + "%"
        player_progress_bar.setAttribute("style", progressBarStyle)
      }

      //update if players are ready, disconnected, waiting to ready up
      var trID = id + "-tr"
      var playerTable = document.getElementById("playerInfo")
      var td1ID = id + "-td1"
      var td2ID = id + "-td2"

      if(document.getElementById(trID) == null){
        var tr = document.createElement("TR")
        tr.setAttribute("id", trID)
        var td1 = document.createElement("TD")
        var td2 = document.createElement("TD")
        td1.setAttribute("id",td1ID)
        td2.setAttribute("id",td2ID)
        tr.appendChild(td1)
        tr.appendChild(td2)
        playerTable.appendChild(tr)
      }
      else{
        var td1 = document.getElementById(td1ID)
        var td2 = document.getElementById(td2ID)
      }

      if(players[id].name == null){
        td1.innerHTML = "Anonymous Racer"
      }
      else{
        td1.innerHTML = players[id].name
      }
      if(players[id].isReady == false){
        td2.innerHTML = "Not ready"
      }
      else{
        td2.innerHTML = "Ready!"
      }

    }
  }
});

//RECEIVE FROM SERVER: deleting a disconnected player's progress bar
//prints that a player has disconnected
socket.on('player_disconnected',function(playerInfo) {
  if (playerInfo[1]) {
    var toBeDeletedBar = document.getElementById(playerInfo[0])
    var toBeDeletedLabel = document.getElementById(playerInfo[0] + "-tag")
    var gameInfo = document.getElementById('gameInfo')
    toBeDeletedBar.parentNode.parentNode.removeChild(toBeDeletedBar.parentNode)
    toBeDeletedLabel.remove()
  }

  var toBeDeletedRow = document.getElementById(playerInfo[0] + "-tr")
  var table = document.getElementById("playerInfo")
  table.removeChild(toBeDeletedRow)
});


//Starts the countdown (to the game) timer
socket.on("gameStart", function (){
  console.log("THE GAME HAS STARTED!")
  startCountdown()
});

//The countdown (to the game) timer is started. This is the "Start in " timer.
//Prints "GAME STARTED" to client
//Makes the client's text box NON-readonly. Client can now enter text
function startCountdown(){
//credit W3 Schools
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
