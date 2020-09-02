
var socket = io();
var room = ""

function gameOver(){
  socket.emit("gameIsOver", room)
}

function playerFinish(){
  var roomAndTimePassed = [room, timePassed, wpm]
  socket.emit("playerFinished", roomAndTimePassed)
}
function joinRoom(roomID){
  socket.emit("playerJoinedRoom", roomID)
  //open typingPage.HTML
  document.body.innerHTML = ""
  document.body.innerHTML = typingPage
  document.cookie = "room="+roomID
  room = roomID
  loadDisplay()

}

function readyBttnClick() {
  //var room = getCookie("room")
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
    // var message = document.createElement("H5")
    // message.innerHTML = "Type fast " + username
    // document.getElementById("nameSpace").appendChild(message)
    usernameAndRoom = [username, room]
    socket.emit("playerReady", usernameAndRoom)
  }
}

socket.on("showEndGameBoard", function(players){
  // <tr>
  //   <td>1st</td>
  //   <td>Dan</td>
  //   <td>34 seconds</td>
  //   <td>67</td>
  // </tr>
  playerArr = []
  for (var id in players) {
    if(players.hasOwnProperty(id)) {
      playerArr.push(players[id])
      console.log(JSON.stringify(players[id]))
    }
  }
  console.log("time passed: " + playerArr[0].timeFinish)
  playerArr.sort(function(p1, p2) {
    if (p1.timeFinish < p2.timeFinish) {
      return -1;
    }
    if (p1.timeFinish > p2.timeFinish) {
      return 1;
    }
    if (p1.wpm > p2.wpm) {
      return -1;
    }
    if (p1.wpm < p2.wpm) {
      return 1;
    }
    return 0
  })
  console.log(JSON.stringify(playerArr))
  var table = document.getElementById("endGameInfo")
  var p = 1
  for (let i = 0; i < playerArr.length; i++) {
    player = playerArr[i]
    console.log(JSON.stringify(player))
    var tr = document.createElement("TR")
    var place = document.createElement("TD")
    place.innerHTML = p
    var name = document.createElement("TD")
    if (p == 1) {
      name.innerHTML = "👑 " + player.name
    } else {
      name.innerHTML = player.name
    }
    var time = document.createElement("TD")
    if(player.timeFinish == 1000000){
      time.innerHTML = "-"
    }
    else{
      time.innerHTML = String(player.timeFinish) + " seconds"
    }
    var wpm = document.createElement("TD")
    if(player.wpm > 100000){
      wpm.innerHTML = "-"
    }
    else{
      wpm.innerHTML = String(player.wpm)
    }
    tr.appendChild(place)
    tr.appendChild(name)
    tr.appendChild(time)
    tr.appendChild(wpm)
    table.appendChild(tr)
    p++
  }
  console.log("showEndGameBoard")
  $('#gameEndLeaderboard').modal({
    backdrop: 'static',
    keyboard: false  // to prevent closing with Esc button (if you want this too)
})
  $('#gameEndLeaderboard').modal('show');
})
socket.on("lockRoom", function(roomID){
  //update roomsPage.html and disable the button
  console.log("received lockRoom request")
  var button = document.getElementById(roomID)
  if (button != null) {
    button.setAttribute('disabled', true)
  }
})

  socket.on("unlockRoom", function(roomID){
    //update roomsPage.html and disable the button
    console.log("received unlockRoom request")
    var button = document.getElementById(roomID)
    if (button != null) {
      button.removeAttribute('disabled')
    }
});

socket.on('playerTableUpdate', function(game){
  console.log("received playerTableUpdate")
  var players = game["players"]
  for (var id in players) {
    if (players.hasOwnProperty(id)) {
      var trID = id + "-tr"
      var playerTable = document.getElementById("playerInfo")
      var td1ID = id + "-td1"
      var td2ID = id + "-td2"
      var td3ID = id + "-td3"

      if(document.getElementById(trID) == null){
        var tr = document.createElement("TR")
        tr.setAttribute("id", trID)
        var td1 = document.createElement("TD")
        var td2 = document.createElement("TD")
        var td3 = document.createElement("TD")
        td1.setAttribute("id",td1ID)
        td2.setAttribute("id",td2ID)
        td3.setAttribute("id",td3ID)
        tr.appendChild(td1)
        tr.appendChild(td2)
        tr.appendChild(td3)
        playerTable.appendChild(tr)
      }
      else{
        var td1 = document.getElementById(td1ID)
        var td2 = document.getElementById(td2ID)
        var td3 = document.getElementById(td3ID)
      }
      td1.innerHTML = players[id].name
      td3.innerHTML = players[id].wpm
      if(players[id].isReady == false){
        td2.innerHTML = "Not ready"
      }
      else{
        td2.innerHTML = "Ready!"
      }
    }
  }
})

socket.on("deleteAloneButton", function(){
  var pAloneButton = document.getElementById("playAloneButton")
  if(pAloneButton != null){
    pAloneButton.remove()
  }
})

socket.on('createProgressBar', function(playerInfo) {
  console.log("create prog bar received")
  var id = playerInfo[0]
  var player = playerInfo[1]
  var color = player.color
  //if player is ready, is playing, and they don't have a prog bar

  //progress_bars is the div that will contain all progress bars
  var progress_bars = document.getElementById("progress_bars")
  //creates div that has prog bar and its label
  // var progressbarwlabel = document.createElement("DIV")
  // progressbarwlabel.setAttribute("id", id + "-progbarandlabel")
  // progressbarwlabel.setAttribute("class", "col-md-12")

  //label for prog bar
  var label = document.createElement("PARAGRAPH")
  label.setAttribute("class", "col-md-1 " + "text-" + color)
  label.setAttribute("id", id + "-tag")
  label.innerHTML = player.name

  //all progress bar content, breakdown of divs is above
  var outMostDiv = document.createElement("DIV")
  outMostDiv.setAttribute("id", id + "-omd")
  outMostDiv.setAttribute("class", "col-md-11")

  var outDiv = document.createElement("DIV")
  outDiv.setAttribute("class", "progress active mb-2")
  outDiv.setAttribute("style", "height: 35px")
  outMostDiv.appendChild(outDiv)
  var classAttribute = "progress-bar progress-bar-striped progress-bar-animated pbar bg-" + color
  var innerDiv = document.createElement("DIV")
  innerDiv.setAttribute("id", id)
  innerDiv.setAttribute("class", classAttribute)
  innerDiv.setAttribute("role", "progressbar")
  innerDiv.setAttribute("style", "width: 0%;")
  outDiv.appendChild(innerDiv)

  progress_bars.appendChild(label)
  progress_bars.appendChild(outMostDiv)
})

socket.on('onConnection', function(games) {
  for (var room in games){
    if(!games[room]['isOpen']){
      var roomButton = document.getElementById(room)
      if(roomButton != null){
        roomButton.setAttribute('disabled', true)
      }
    }
  }
});

  socket.on('updateProgressBars', function (players) {
    for (var id in players) {
      if (players.hasOwnProperty(id)) {
        var wpmElt = document.getElementById(id + "-td3")
        wpmElt.innerHTML = String(players[id].wpm)
        var player_progress_bar = document.getElementById(id)
        var progressBarStyle = "width: " + String(players[id].player_progress) + "%"
        player_progress_bar.setAttribute("style", progressBarStyle)
      }
    }
  })

socket.on("alonePlayer", function(){
   console.log('received alone player')
  // var userInput = confirm("Do you really want to play a typing game by your self?");
  // if(userInput == true){
  //   //player wants to play alone
  //   socket.emit("playerWantsToPlayAlone", room)
  // }
  swal("Do you really want to play a typing game by your self?", {
     buttons: ["No", "Yes"],
  })

.then((value) => {
  if (value) {
    console.log("The user wants to play alone");
    socket.emit("playerWantsToPlayAlone", room)
  }
  else{
    //player doesnt want to play, so we unlock the room
    socket.emit("emitUnlockroom", room)
    var nameSpace = document.getElementById("nameSpace")
    var playAloneButton = document.createElement("BUTTON")
    playAloneButton.setAttribute("id", "playAloneButton")
    playAloneButton.setAttribute("type", "button")
    playAloneButton.setAttribute("class", "btn btn-success")
    playAloneButton.setAttribute("onClick", "playAlone()")
    playAloneButton.innerHTML = "Play Alone"
    nameSpace.appendChild(playAloneButton)
  }
});
});
function playAlone(){
  socket.emit("playerWantsToPlayAlone", room)
  socket.emit("emitLockRoom", room)
  var pAloneButton = document.getElementById("playAloneButton")
  if(pAloneButton != null){
    pAloneButton.remove()
  }
}
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

var typingPage = `<body>
  <div class = "container">
    <div class = "row">
      <div class = "col-9">
      <img src = "logos/TypeRunner_Main_LogoTypingPage.svg" alt = "TypeRunner" style = "height: 200px; width: 415px;">
      </div>
      <div class = "col-3">
      <div id = "gameInfo">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th scope="col" class = "text-center">Name</th>
              <th scope="col" class = "text-center">Game Status</th>
              <th scope="col" class = "text-center">WPM</th>
            </tr>
          </thead>
          <tbody id = "playerInfo">
          </tbody>
        </table>
      </div>
      </div>
    </div>
  <br/>


  <div id="nameSpace">
    <form id="name_form" class="form-inline">
        <input type="text" id="name_in" class="form-control mr-sm-2" placeholder="Name"/>
        <button type="button" class="btn btn-danger" id = "readyButton" onclick = "readyBttnClick()">Ready</button>
        <div id="name_feedback">
        </div>
    </form>
  </div>
  <br/>


  <div class = "row">
    <div class = "flex-md-column col-md-9">
      <div id="progress_bars" class="row" >
      </div>
      <p id = "correct_text" class = "alert alert-info">I love u of m</p>
        <div class="row">
            <div class="input-group-prepend col-md-11">
              <input type="text" id="in" class="form-control" readonly = true placeholder="you better type fast!"/>
            </div>
        <div class = "col-md-1">
        <div id="app">
        </div>
        </div>
        </div>
    <br/>
    <div class="row col-3">
    <p id="wpm">wpm</p>
    </div>
    </div>
  <div class = "col-md-3">
    <div id = "startTimer">
    </div>
  </div>
</div>
</div>
<div class="modal fade" id="gameEndLeaderboard" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="gameEndLeaderboardTitle">Finishing Stats</h5>
      </div>
      <div class="modal-body">
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Place</th>
              <th scope="col">Name</th>
              <th scope="col">Finishing Time</th>
              <th scope="col">WPM</th>
            </tr>
          </thead>
          <tbody id = "endGameInfo">
          </tbody>
        </table>
      </div>
      <div class="modal-footer">

        <button type="button" class="btn btn-success" onClick = "returnToHomePage()">Return to home page</button>
      </div>
    </div>
  </div>
</div>
<script>
  $('#gameEndLeaderboard').modal({ show: false})
</script>

  <!-- Optional JavaScript -->
  <!-- jQuery first, then Popper.js, then Bootstrap JS -->
</body>`



//socket.on('JoinedARoom', function(roomCode) {
//   room = roomCode
//   console.log("RoomCode: " + roomCode)
// });
//
socket.on("deletePlayerInTable", function(idAndRoomCode){
  var id = idAndRoomCode[0]
  var roomCode = idAndRoomCode[1]
  var trID = id + "-tr"
  var trIDElement = document.getElementById(trID)
  trIDElement.remove()
})
//
// socket.on('playerTableUpdate', function(game){
//   //console.log(game)
//   var players = game["players"]
//   for (var id in players) {
//     if (players.hasOwnProperty(id)) {
//       var trID = id + "-tr"
//       var playerTable = document.getElementById("playerInfo")
//       var td1ID = id + "-td1"
//       var td2ID = id + "-td2"
//
//       if(document.getElementById(trID) == null){
//         var tr = document.createElement("TR")
//         tr.setAttribute("id", trID)
//         var td1 = document.createElement("TD")
//         var td2 = document.createElement("TD")
//         td1.setAttribute("id",td1ID)
//         td2.setAttribute("id",td2ID)
//         tr.appendChild(td1)
//         tr.appendChild(td2)
//         playerTable.appendChild(tr)
//       }
//       else{
//         var td1 = document.getElementById(td1ID)
//         var td2 = document.getElementById(td2ID)
//       }
//       td1.innerHTML = players[id].name
//       if(players[id].isReady == false){
//         td2.innerHTML = "Not ready"
//       }
//       else{
//         td2.innerHTML = "Ready!"
//       }
//     }
//   }
// })
//

//
socket.on('deleteProgressBar', function(id) {
  var outMostDiv = document.getElementById(id + "-omd")
  var label = document.getElementById(id + "-tag")
  label.remove()
  outMostDiv.remove()
})

// //Starts the countdown (to the game) timer
socket.on("gameStart", function (){
  console.log("THE GAME HAS STARTED!")
  startCountdown()
  //var roomCode = getCookie("room")
  setInterval(function() {
    //gets the progress from display.js
    var my_progress = {
      progress: getProgress()
    }
    //emits the progess 60x/second
    var progressAndRoomCode = [my_progress, room, wpm]
    socket.emit('progressUpdate', progressAndRoomCode);
  }, 1000 / 60);
});
//
// //The countdown (to the game) timer is started. This is the "Start in " timer.
// //Prints
// //Makes the client's text box NON-readonly. Client can now enter text
function startCountdown(){
//credit W3 Schools
  var curr = 0
  var x = setInterval(function() {

  // Get today's date and time
  // Find the distance between now and the count down date
    var distance = 3000 - curr;
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

function loadDisplay(){
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", "static/display.js");
  document.getElementsByTagName("head")[0].appendChild(script);
}

function returnToHomePage(){
  location.reload()
}




//RECEIVE FROM SERVER: Creates new player's progress bars and gives the new
//player who is connected who all is ready

//Runs when the SERVER emits "new_connection" and the players object
//This iterates through the player's object and, via player ID, creates a
//progress bar for each player as well as printing who's ready
//The progress bar is as follows:
//                 <label>
//                 </label>
// outMostDiv -- > <div class = "col-mod-11">
// outDiv -- >       <div class = "progress active mb-2" style = "height: 35px">
// innerDiv -- >         <div class = "progress-bar progress-bar-striped pbar COLOR"
//                       id = "id" role = "progressbar" style = "width: 0%;">
//                       </div>
//                   </div>
//                 </div>
//RECEIVE FROM SERVER 60x/second: creates and updates ALL player's progress bars
//as well as their ready status

// socket.on('state', function(gameState) {
//   var players = gameState.players
//   for (var id in players) {
//     if (players.hasOwnProperty(id)) {
//       //if player is ready, is playing, and they don't have a prog bar
//
//       //progress_bars is the div that will contain all progress bars
//       var progress_bars = document.getElementById("progress_bars")
//
//       if (players[id].isReady && players[id].isPlaying &&
//           (document.getElementById(id) == null)){
//             //label for prog bar
//             var label = document.createElement("PARAGRAPH")
//             label.setAttribute("class", "col-md-1")
//             label.setAttribute("id", id + "-tag")
//             label.innerHTML = players[id].name
//
//             //all progress bar content, breakdown of divs is above
//             var outMostDiv = document.createElement("DIV")
//             outMostDiv.setAttribute("class", "col-md-11")
//
//             var outDiv = document.createElement("DIV")
//             outDiv.setAttribute("class", "progress active mb-2")
//             outDiv.setAttribute("style", "height: 35px")
//             outMostDiv.appendChild(outDiv)
//             var color = players[id].color
//             var classAttribute = "progress-bar progress-bar-striped progress-bar-animated pbar " + color
//             var innerDiv = document.createElement("DIV")
//             innerDiv.setAttribute("id", id)
//             innerDiv.setAttribute("class", classAttribute)
//             innerDiv.setAttribute("role", "progressbar")
//             innerDiv.setAttribute("style", "width: 0%;")
//             outDiv.appendChild(innerDiv)
//             progress_bars.appendChild(label)
//             progress_bars.appendChild(outMostDiv)
//
//           }
//
//       var player_progress_bar = document.getElementById(id)
//       //updates progress bar
//       if (gameState.hasStarted && player_progress_bar != null){
//         var progressBarStyle = "width: " + String(players[id].player_progress) + "%"
//         player_progress_bar.setAttribute("style", progressBarStyle)
//       }
//
//       //update if players are ready, disconnected, waiting to ready up
//       var trID = id + "-tr"
//       var playerTable = document.getElementById("playerInfo")
//       var td1ID = id + "-td1"
//       var td2ID = id + "-td2"
//
//       if(document.getElementById(trID) == null){
//         var tr = document.createElement("TR")
//         tr.setAttribute("id", trID)
//         var td1 = document.createElement("TD")
//         var td2 = document.createElement("TD")
//         td1.setAttribute("id",td1ID)
//         td2.setAttribute("id",td2ID)
//         tr.appendChild(td1)
//         tr.appendChild(td2)
//         playerTable.appendChild(tr)
//       }
//       else{
//         var td1 = document.getElementById(td1ID)
//         var td2 = document.getElementById(td2ID)
//       }
//
//       if(players[id].name == null){
//         td1.innerHTML = "Anonymous Racer"
//       }
//       else{
//         td1.innerHTML = players[id].name
//       }
//       if(players[id].isReady == false){
//         td2.innerHTML = "Not ready"
//       }
//       else{
//         td2.innerHTML = "Ready!"
//       }
//
//     }
//   }
// });

//RECEIVE FROM SERVER: deleting a disconnected player's progress bar
//prints that a player has disconnected
// socket.on('player_disconnected',function(playerInfo) {
//   if (playerInfo[1]) {
//     var toBeDeletedBar = document.getElementById(playerInfo[0])
//     var toBeDeletedLabel = document.getElementById(playerInfo[0] + "-tag")
//     var gameInfo = document.getElementById('gameInfo')
//     toBeDeletedBar.parentNode.parentNode.removeChild(toBeDeletedBar.parentNode)
//     toBeDeletedLabel.remove()
//   }
//
//   var toBeDeletedRow = document.getElementById(playerInfo[0] + "-tr")
//   var table = document.getElementById("playerInfo")
//   table.removeChild(toBeDeletedRow)
// });
