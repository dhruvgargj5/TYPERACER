var socket = io();

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
      socket.emit("NameSubmitted", username)
      socket.emit('playerReady')
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
// outMostDiv -- > <div class = "col-mod-12">
//                       <label>
//                        </label>
// outDiv -- >       <div class = "progress active mb-2" style = "height: 35px">
// innerDiv -- >         <div class = "progress-bar progress-bar-striped pbar COLOR"
//                       id = "id" role = "progressbar" style = "width: 0%;">
//                       </div>
//                   </div>
//                 </div>
socket.on('new_connection', function(players){
  console.log("a new person has connected")
  //progress_bars is the div that will contain all progress bars
  var progress_bars = document.getElementById("progress_bars")
  //empties all progress bars, so we can populate them for the new connection
  progress_bars.innerHTML = ""
  //list of colors for the progress bars
  var colors = ["bg-success", "bg-info", "bg-warning", "bg-danger","bg-primary"]
  var counter = 0

  //whoIsReady is the HTML where the "Player is ready will be"
  var whoisReady = document.getElementById("whoReady")
  whoisReady.innerHTML = ""
  for (var id in players) {
    if (players.hasOwnProperty(id)) {
      //Checks to see if the player is playing and if so it creates a progress
      //bar for that player
      //isPlaying is determined server side
      if (players[id].isPlaying) {

        //all progress bar content, breakdown of divs is above
        var outMostDiv = document.createElement("DIV")
        outMostDiv.setAttribute("class", "col-md-12")

        var outDiv = document.createElement("DIV")
        outDiv.setAttribute("class", "progress active mb-2")
        outDiv.setAttribute("style", "height: 35px")
        outMostDiv.appendChild(outDiv)
        //sets the color of each bar
        var color = colors[counter]
        var classAttribute = "progress-bar progress-bar-striped progress-bar-animated pbar " + color
        var innerDiv = document.createElement("DIV")
        innerDiv.setAttribute("id", id)
        innerDiv.setAttribute("class", classAttribute)
        innerDiv.setAttribute("role", "progressbar")
        innerDiv.setAttribute("style", "width: 0%;")
        outDiv.appendChild(innerDiv)
        progress_bars.appendChild(outMostDiv)
        counter = (counter + 1) % 5
      }

      //prints to the client which players are ready
      // if (players[id].isReady) {
      //   var message = "Player " + players[id].name + " is ready.<br>"
      //   whoisReady.innerHTML += message
      // }
    }
}
});
// <tr>
//     <td>Mark</td>
//     <td>Otto</td>
// </tr>
// <tr>
//     <td>Jacob</td>
//     <td>Thornton</td>
// </tr>
// <tr>
//     <td>Larry</td>
//     <td>the Bird</td>
// </tr>

//RECEIVE FROM SERVER 60x/second: update ALL player's progress bars
socket.on('state', function(players) {
  for (var id in players) {
    if (players.hasOwnProperty(id)) {
      var player_progress_bar = document.getElementById(id)
      var progressBarStyle = "width: " + String(players[id].player_progress) + "%"
      player_progress_bar.setAttribute("style", progressBarStyle)

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
  var toBeDeletedBar = document.getElementById(playerInfo[0])
  var toBeDeletedRow = document.getElementById(playerInfo[0] + "-tr")
  toBeDeletedBar.parentNode.parentNode.removeChild(toBeDeletedBar.parentNode)
  var gameInfo = document.getElementById('gameInfo')
  var table = document.getElementById("playerInfo")
  table.removeChild(toBeDeletedRow)
});


//Starts the countdown (to the game) timer
socket.on("gameStart", function (){
  console.log("game has started")
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
