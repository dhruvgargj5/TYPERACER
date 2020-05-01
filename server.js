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
});

//prints hi
setInterval(function() {
  io.sockets.emit('message', 'hi!');
}, 1000);

var players = {};
io.on('connection', function(socket) {
  players[socket.id] = {
    player_progress: 0
  };
  console.log("Someone has connected, id: " + socket.id)
  io.sockets.emit('new_connection', players)

  socket.on('type', function(data) {
    var player = players[socket.id] || {};
    player.player_progress = data.progress;
    //console.log("socket id: " + socket.id + ", progress: " + player.player_progress)
  });
});

setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);

io.on('connection', function(socket) {
  // other handlers ...
  socket.on('disconnect', function() {
    // remove disconnected player
  });
});
