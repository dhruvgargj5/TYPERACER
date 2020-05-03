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

// makes a gameState JSON that holds players and game info
var gameState = {};
gameState["players"] = {};
gameState["hasStarted"] = false;
var players =  gameState.players

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
  players[socket.id] = {
    player_progress: 0,
    isReady : false,
    win : false,
    isPlaying: true
  };
  // doesn't let player participate if the game has started
  // hasStarted -> countdown has begin (all present players are ready)
  if (gameState.hasStarted) {
    players[socket.id].isPlaying = false;
  }

  // emits all players data to update clients progress bars when a new player connects
  io.sockets.emit('new_connection', players)

  // updates all players progress in players JSON (60 times/sec)
  socket.on('progressUpdate', function(data) {
    var player = players[socket.id] || {};
    player.player_progress = data.progress;
  });

});

// sends game state to clients to update progress bars (60 times/sec)
setInterval(function() {
  io.sockets.emit('state', gameState.players);
}, 1000 / 60);


//deletes a player when they disconnect
io.on('connection', function(socket) {
  socket.on('disconnect', function() {
    var players = gameState.players
    var playerInfo = [socket.id, players[socket.id].name]
    io.sockets.emit('player_disconnected', playerInfo)
    delete players[socket.id]
  });
});
