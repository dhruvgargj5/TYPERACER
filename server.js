var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var games = {}
var colors = ["danger", "success", "primary", "warning"]
var colorCounter = 0
// var colors =
// {
//   "red" : {"progBar" :"bg-danger" , "text" :  "text-danger"},
//   "green" : {"progBar" : "bg-success", "text" : "text-success" },
//   "blue" : {"progBar" : "bg-primary", "text" : "text-primary" },
//   "yellow" : {"progBar" : "bg-warning" , "text" :  "text-warning"},
// }

// games {
//   room-1: {
//     hasStarted: true
//     players: {
//       id1: {
//         //player info
//       },
//       id2: {
//         //player info
//       }
//     }
//   }
//   room-2: {
//
//   }
// }


app.set('port', 5000);
app.use('/static', express.static('./static/'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'typingPage.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});


var roomNo = 0
io.on("connection", function(socket){
  addPersonToRoom(socket)
  colorCounter = (colorCounter + 1) % 4
  console.log(games)
});

//creates game state object
function addPersonToRoom(socket){
  //Cases
  //Attempt to join a room that has < 4
  //Attempt to join a room that has 4 or more
  var roomCode = "room-" + roomNo
  if(io.nsps['/'].adapter.rooms["room-"+roomNo] &&
    io.nsps['/'].adapter.rooms["room-" + roomNo].length >= 4){
      //"creates" a new room
      roomNo++
      roomCode = "room-" + roomNo
  }

  socket.join(roomCode)
  //if room doesn't exist in JSON
  if(games[roomCode] == null){
    games[roomCode] = {
      hasStarted: false,
      players: {}
    }
  }

  addPersonToJSON(socket, roomCode)
  io.sockets.in(roomCode).emit('roomIsJoined',roomCode)
}

//playerTable update
//players are populated
function addPersonToJSON(socket, roomCode){
  var game = games[roomCode]
  var players = game.players
  players[socket.id] = {
    name : "Anonymous Racer",
    player_progress: 0,
    finishingPlace : 0,
    color : colors[colorCounter],
    isReady : false,
    wpm : 0,
    accuracy : 0
  };
}






// makes a gameState JSON that holds players and game info
var gameState = {};
gameState["players"] = {};
gameState["hasStarted"] = false;
var players =  gameState.players
var colors = ["bg-success", "bg-info", "bg-warning", "bg-danger","bg-primary"]
var colorCounter = 0

// Add the WebSocket handlers
io.on('connection', function(socket) {
  var players = gameState.players
  socket.on('NameSubmitted', function(username){
    players[socket.id]["name"] = username
  })
  // when a player clicks their ready button
  socket.on('playerReady', function()
  {
    // if they haven't already clicked it
    if(players[socket.id].isReady == false)
    {
      // display player connected message
      players[socket.id].isReady = true
      // var message = players[socket.id].name + " is ready.<br>"
      // io.sockets.emit("otherPlayerReady", message)
    }

    // checks if everyone is ready
    var allReady = true
    for (var id in players){
      if (players.hasOwnProperty(id)){
        var ready = players[id].isReady
        if (!ready){
          allReady = false
        }
      }
    }
    // if everyone is ready->hasStarted to true and emit gameStart
    if(allReady){
      gameState.hasStarted = true;
      io.sockets.emit('gameStart')
    }
  });
  // creates a new player when they join
  var color_in = colors[colorCounter]
  players[socket.id] = {
    player_progress: 0,
    isReady : false,
    win : false,
    isPlaying: true,
    color : color_in
  };
  colorCounter = (colorCounter + 1) % 5
  // doesn't let player participate if the game has started
  // hasStarted -> countdown has begin (all present players are ready)
  if (gameState.hasStarted) {
    players[socket.id].isPlaying = false;
  }

  // emits all players data to update clients progress bars when a new player connects

  // updates all players progress in players JSON (60 times/sec)
  socket.on('progressUpdate', function(data) {
    var player = players[socket.id] || {};
    player.player_progress = data.progress;
  });

});

// sends game state to clients to update progress bars (60 times/sec)
setInterval(function() {
  io.sockets.emit('state', gameState);
}, 1000 / 60);


//deletes a player when they disconnect
io.on('connection', function(socket) {
  socket.on('disconnect', function() {
    var players = gameState.players
    var playerInfo = [socket.id, players[socket.id].isReady]
    console.log(gameState)
    io.sockets.emit('player_disconnected', playerInfo)
    delete players[socket.id]
    if (players == {}) {
      gameState.hasStarted = false
    }
  });
});
