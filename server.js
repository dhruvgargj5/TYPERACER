var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var games = {}
var colors = ["danger", "success", "primary", "warning"]

app.set('port', 5000);
app.use('/static', express.static('./static/'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'roomsPage.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

io.on('connection', function(socket){
  io.emit('onConnection', games)
  socket.on('playerReady', function(usernameAndRoom){
    //console.log("player ready received from game")
    readyUp(socket, usernameAndRoom)
    var roomCode = usernameAndRoom[1]
    updatePlayerTable(roomCode)
    var playerInfo = [socket.id, games[roomCode]["players"][socket.id]]
    io.in(roomCode).emit('createProgressBar', playerInfo)
  })
  socket.on("playerJoinedRoom", function(roomID){
    //DO LATER check if roomID is in games, if not then it adds it
    //initialize games[roomID]['hasStarted'] = false
    //add player (socket.id) to games[roomID]["players"]
    //checks if room is full, if so then emit lockRoom(roomID).
    //on the client side this will just disable the "join room" button
    //actually add them to the room with socket.join(roomID)
    //emit games[roomID] back to the whole room so the client can update the html side
    if(!games.hasOwnProperty(roomID)){
      games[roomID] = {
                'isOpen' : true,
                'hasStarted' : false,
                'isGameDone' : false,
                'colors' : ["danger", "success", "primary", "warning"],
                'colorCounter' : 0,
                'players' : {}
              };
    }
    var players = games[roomID]['players']
    //console.log("socket.id: " + socket.id)
    players[socket.id] = {
      name : "Anonymous Racer",
      player_progress: 0,
      finishingPlace : 0,
      color : games[roomID].colors[games[roomID].colorCounter],
      isReady : false,
      wpm : 0,
      accuracy : 0,
      timeFinish : -1,
      isDone : false
    };
    games[roomID].colorCounter = (games[roomID].colorCounter + 1) % 4;

    var roomCapacity = Object.keys(players).length;
    console.log(JSON.stringify(games, undefined, 4))
    //console.log("room capacity: " + roomCapacity)
    if(roomCapacity == 4){
      //game receives this emit, and then disables the button that corresponds
      //to 'roomID'
      games[roomID]['isOpen'] = false;
      io.emit('lockRoom', roomID)
      console.log("lock Room 78")
    }
    socket.join(roomID)
    io.in(roomID).emit('playerTableUpdate',games[roomID])
    //update progress bar here by emitting 'createProgressBar'
    for (var id in players){
      if (players.hasOwnProperty(id)){
        if(players[id].isReady){
          var playerInfo = [id, games[roomID]["players"][id]]
          socket.emit('createProgressBar', playerInfo)
        }
      }
    }
  });

  setInterval(function() {
    for (var roomCode in games){
      if (games.hasOwnProperty(roomCode)){
        if(games[roomCode].hasStarted){
          io.in(roomCode).emit('updateProgressBars', games[roomCode].players)
        }
      }
    }
   }, 1000 / 60);

  socket.on('progressUpdate', function(progressAndRoomCode) {
    //console.log(roomCode)
    var playerProgress = progressAndRoomCode[0]
    var roomCode = progressAndRoomCode[1]
    var player = games[roomCode]["players"][socket.id];
    //console.log("socketID: " + socket.id)
    //console.log(roomCode)
    player.player_progress = playerProgress.progress;
  });
  socket.on("playerWantsToPlayAlone", function(room){
    games[room]["hasStarted"] = true;
    games[room]["isOpen"] = false;
    io.in(room).emit('gameStart')
    io.emit('lockRoom', room)
  })

  socket.on("playerFinished", function(roomAndTimePassed){
    var room = roomAndTimePassed[0]
    var time = roomAndTimePassed[1]
    var wpm =  roomAndTimePassed[2]
    var players = games[room]['players']
    var player = players[socket.id]
    player.isDone = true;
    player.timeFinish = time;
    player.WPM = wpm;
    var allDone = true
    for (var id in players){
      if (players.hasOwnProperty(id)){
        if(!players[id].isDone){
          allDone = false
        }
      }
    }
    if(allDone){
      gameFinish(room)
    }
  })

  socket.on("gameIsOver", function(room){
    if(!games[room].isGameDone){
      gameFinish(room)
    }
  })
  socket.on('disconnecting', function(){
    var self = this;
    var room = Object.keys(self.rooms)[1];
    var idAndRoomCode = [socket.id, room]
    socket.to(room).emit("deletePlayerInTable",idAndRoomCode)
    //players might not be in the room, do a check here
    var isReady = games[room]['players'][socket.id].isReady
    if(isReady){
      socket.to(room).emit('deleteProgressBar', socket.id)
    }
    delete games[room]['players'][socket.id]

    var players = games[room].players
    var gameHasStarted = games[room].hasStarted
    if(!gameHasStarted){
      var players = games[room].players
      io.emit('unlockRoom', room)
      games[room].isOpen = true;
      if(Object.keys(players).length == 1){
        console.log("ALONE PLAYER")
        io.emit("alonePlayer")
      }
      else if (checkReady(room)) {
        games[room]["hasStarted"] = true;
        games[room]["isOpen"] = false;
        socket.to(room).emit('gameStart')
        console.log("lockRoom 172")
        io.emit('lockRoom', room)
      }
    }
    //game has started
    else{
      var players = games[room].players
      if(Object.keys(players).length == 0){
        io.emit('unlockRoom', room)
        games[room].isOpen = true;
        games[room].hasStarted = false;
      }
    }


  });
  socket.on("disconnect", function() {
    //leave room stuff
    //should be similar to what we had before
     console.log(socket.id + " has disconnected")
    // var rooms = socket.rooms
    // console.log(rooms)
    // console.log(typeof(room))
    //take player out of JSON
    //delete progress bars if they are ready
    //delete from playertable
    //if game hasn't started, open up the room
    //if this is the last person in the room, open up the room
  });
});

function gameFinish(room){
  games[room].isGameDone = true
  io.in(room).emit("showEndGameBoard", games[room]["players"])
}

function updatePlayerTable(roomCode) {
  io.in(roomCode).emit('playerTableUpdate', games[roomCode])
}

function readyUp(socket, usernameAndRoom) {
  //updates name
  var username = usernameAndRoom[0]
  var room = usernameAndRoom[1]
  console.log("ID: " + socket.id + ", Room: " + room)
  var players = games[room]["players"]
  var player = players[socket.id]
  player["name"] = username
  //console.log("PLAYER WHO READY UP NAME: " + player["name"])


  //checks ready status
  // if they haven't already clicked it
  if(player.isReady == false)
  {
    // display player connected message
    player.isReady = true
    // var message = players[socket.id].name + " is ready.<br>"
    // io.sockets.emit("otherPlayerReady", message)
  }

  // checks if everyone is ready
  var players = games[room].players
  if(Object.keys(players).length == 1){
    console.log("ALONE PLAYER")
    io.emit("alonePlayer")
  }
  else if (checkReady(room)) {
    games[room]["hasStarted"] = true;
    games[room]["isOpen"] = false;
    io.in(room).emit('gameStart')
    io.emit('lockRoom', room)
    console.log("lockRoom 291")
  }
}

function checkReady(room) {
  var players = games[room].players
  var allReady = true
  for (var id in players){
    if (players.hasOwnProperty(id)){
      var ready = players[id].isReady
      if (!ready){
        allReady = false
      }
    }
  }
  return allReady
}
