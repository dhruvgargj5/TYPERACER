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
// app.get('/type', function(request, response) {
//   response.sendFile(path.join(__dirname, 'typingPage.html'));
// });

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

io.on('connection', function(socket){
  io.emit('onConnection', games)
  socket.on('playerReady', function(usernameAndRoom){
    console.log("player ready received from game")
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
                'colors' : ["danger", "success", "primary", "warning"],
                'colorCounter' : 0,
                'players' : {}
              };
    }
    var players = games[roomID]['players']
    console.log("socket.id: " + socket.id)
    players[socket.id] = {
      name : "Anonymous Racer",
      player_progress: 0,
      finishingPlace : 0,
      color : games[roomID].colors[games[roomID].colorCounter],
      isReady : false,
      wpm : 0,
      accuracy : 0
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
          io.in(roomCode).emit('updateProgressBars', games.roomCode.players)
        }
      }
    }
   }, 1000 / 60);

  socket.on('progressUpdate', function(progressAndRoomCode) {
    //console.log(roomCode)
    var playerProgress = progressAndRoomCode[0]
    var roomCode = progressAndRoomCode[1]
    var player = games[roomCode]["players"][socket.id];
    player.player_progress = playerProgress.progress;
  });

  socket.on("disconnect", function() {
    //leave room stuff
    //should be similar to what we had before
  });
});




// io.on("connection", function(socket){
//   //console.log("NEW CONNECTION: ", socket.id)
//   var roomCode = addPersonToRoom(socket)
//   //call playerTable update
//   updatePlayerTable(roomCode)
//   colorCounter = (colorCounter + 1) % 4
//
//
//
//   socket.on('disconnect', function() {
//     //console.log("Disconnected: " + socket.id)
//     socket.leave(roomCode)
//     //console.log(io.nsps['/'].adapter.rooms)
//     var leavingPlayerReady = games[roomCode]["players"][socket.id].isReady
//     delete games[roomCode]["players"][socket.id]
//     if (isEmpty(games[roomCode]["players"])) {
//       delete games[roomCode]
//       // console.log("Disconnect,  pre increment")
//       // console.log("RoomNo: " + roomNo)
//       // console.log("RoomCode: " + roomCode)
//       // console.log("Disconnect,  post increment")
//       // console.log("RoomNo: " + roomNo)
//       // console.log("RoomCode: " + roomCode)
//     }
//     else {
//       checkReady(roomCode)
//       deletePlayerInTable(socket.id,roomCode)
//       if(leavingPlayerReady){
//         io.in(roomCode).emit('deleteProgressBar', socket.id)
//       }
//     }
//     //console.log("Disconnect: ")
//     //console.log(games)
//   });
//
//

//    //console.log("Connect:")
//   //console.log(games)
// });

// function deletePlayerInTable(id, roomCode){
//   var idAndRoomCode = [id,roomCode]
//   io.in(roomCode).emit("deletePlayerInTable",idAndRoomCode)
// }


//playerTableUpdate function
//  emit to a specifc room the whole gameState?
// client side: they take the gameState and edit HTML
function updatePlayerTable(roomCode) {
  io.in(roomCode).emit('playerTableUpdate', games[roomCode])
}

function readyUp(socket, usernameAndRoom) {
  //updates name
  var username = usernameAndRoom[0]
  var room = usernameAndRoom[1]
  var players = games[room]["players"]
  var player = players[socket.id]
  player["name"] = username
  console.log("PLAYER WHO READY UP NAME: " + player["name"])


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
  if (checkReady(room)) {
    games[room]["hasStarted"] = true;
    games[room]["isOpen"] = false;
    io.in(room).emit('gameStart')

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

// //creates game state object
// function addPersonToRoom(socket){
//   //Cases
//   //Attempt to join a room that has < 4
//   //Attempt to join a room that has 4 or more
//   var roomCode = "room-" + roomNo
//   if(io.nsps['/'].adapter.rooms[roomCode] &&
//     (io.nsps['/'].adapter.rooms[roomCode].length >= 4 ||
//     games[roomCode].hasStarted)){
//       //"creates" a new room
//       //console.log("roomNo is incremented at addingPersonToRoom")
//       roomNo++
//       roomCode = "room-" + roomNo
//       // console.log("RoomNo: " + roomNo)
//       // console.log("RoomCode: " + roomCode)
//   }
//
//   socket.join(roomCode)
//   socket.emit('JoinedARoom', roomCode)
//   //console.log(io.nsps['/'].adapter.rooms)
//
//   //if room doesn't exist in JSON
//   if(!games.hasOwnProperty(roomCode)){
//     games[roomCode] = {
//       hasStarted: false,
//       players: {}
//     }
//   }
//   addPersonToJSON(socket, roomCode)
//   return roomCode
// }

//playerTable update
//players are populated
// function addPersonToJSON(socket, roomCode){
//   var game = games[roomCode]
//   var players = game.players
//   players[socket.id] = {
//     name : "Anonymous Racer",
//     player_progress: 0,
//     finishingPlace : 0,
//     color : colors[colorCounter],
//     isReady : false,
//     wpm : 0,
//     accuracy : 0
//   };
// }
//
//       // if everyone is ready->hasStarted to true and emit gameStart
//   if(allReady){
//     games[room]["hasStarted"] = true;
//     io.in(room).emit('gameStart')
//   }
// }

// function isEmpty(obj) {
//     for(var key in obj) {
//         if(obj.hasOwnProperty(key))
//             return false;
//     }
//     return true;
// }




//
// // makes a gameState JSON that holds players and game info
// var gameState = {};
// gameState["players"] = {};
// gameState["hasStarted"] = false;
// var players =  gameState.players
// var colors = ["bg-success", "bg-info", "bg-warning", "bg-danger","bg-primary"]
// var colorCounter = 0
//
// // Add the WebSocket handlers
// io.on('connection', function(socket) {
//   var players = gameState.players
//   socket.on('NameSubmitted', function(username){
//     players[socket.id]["name"] = username
//   })
//   // when a player clicks their ready button
//   socket.on('playerReady', function()
//   {
//
//   });
//   // creates a new player when they join
//   var color_in = colors[colorCounter]
//   players[socket.id] = {
//     player_progress: 0,
//     isReady : false,
//     win : false,
//     isPlaying: true,
//     color : color_in
//   };
//   colorCounter = (colorCounter + 1) % 5
//   // doesn't let player participate if the game has started
//   // hasStarted -> countdown has begin (all present players are ready)
//   if (gameState.hasStarted) {
//     players[socket.id].isPlaying = false;
//   }
//
//   // emits all players data to update clients progress bars when a new player connects
//
//   // updates all players progress in players JSON (60 times/sec)
//   socket.on('progressUpdate', function(data) {
//     var player = players[socket.id] || {};
//     player.player_progress = data.progress;
//   });
//
// });
//
// // sends game state to clients to update progress bars (60 times/sec)

//
