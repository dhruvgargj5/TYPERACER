var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);


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

// Add the WebSocket handlers
io.on('connection', function(socket) {
  var players = gameState.players
  socket.on('playerReady', function()
  {
    if(players[socket.id].isReady == false)
    {
      players[socket.id].isReady = true
      var message = "Player " + socket.id + " is ready.<br>"
      io.sockets.emit("otherPlayerReady", message)
    }

    //if everyone is ready, it sets hasStarted to true and emits gameStart
    var allReady = true
    for (var id in players){
      if (players.hasOwnProperty(id)){
        var ready = players[id].isReady
        if (!ready){
          allReady = false
        }
      }
    }
    if(allReady){
      gameState.hasStarted = true;
      io.sockets.emit('gameStart')
    }
  });
});

var gameState = {};
gameState["players"] = {};
gameState["hasStarted"] = false;
var players =  gameState.players

io.on('connection', function(socket) {
  players[socket.id] = {
    player_progress: 0,
    isReady : false,
    win : false,
    isPlaying: true
  };
  if (gameState.hasStarted) {
    players[socket.id].isPlaying = false;
  }
  console.log("gameState: ")
  console.log(gameState)
  //console.log("Someone has connected, id: " + socket.id)
  io.sockets.emit('new_connection', players)

  socket.on('progressUpdate', function(data) {
    var player = players[socket.id] || {};
    player.player_progress = data.progress;
  });

});

setInterval(function() {
  io.sockets.emit('state', gameState.players);
}, 1000 / 60);

io.on('connection', function(socket) {
  socket.on('disconnect', function() {
    var playerID = socket.id
    players[socket.id].player_progress = 0
    io.sockets.emit('player_disconnected', playerID)
    delete players[playerID]
  });
});
