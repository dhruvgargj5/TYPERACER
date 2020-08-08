var socket = io();

function joinRoom(roomID){
  socket.emit("playerJoinedRoom", roomID)
  console.log("Player joined room: " + roomID + "with socket ID: " + socket.id)
  //open typingPage.HTML
}

socket.on("lockRoom", function(roomID){
  //update roomsPage.html and disable the button
  console.log("received lockRoom request")
  var button = document.getElementById(roomID)
  button.setAttribute('disabled', true)
});

socket.on('onConnection', function(games) {
  for (var room in games){
    if(!games[room]['isOpen']){
      var roomButton = document.getElementById(room)
      roomButton.setAttribute('disabled', true)
    }
  }
});
