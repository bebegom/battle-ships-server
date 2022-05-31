/**
 * Socket Controller
 */

//  const { emit } = require('nodemon');

 const debug = require('debug')('clock:socket_controller');
 let io = null; // socket.io server instance
 
 let room = []
 
 const lobby = []
 
 /**
  * Helpers
  */
 
 // randomize what player that starts
 const randomPlayerStart = (userId, opponent) => {
	 const randomNumber = (max) => {
		 return Math.floor(Math.random() * max)
	 }
 
	 if (randomNumber(11) <= 5) {
		 //player one start
		 return userId 
	 } else {
		 //player two start
		 return opponent
	 }
 }
 
 
 /**
  * Handle a user connecting
  */
 const handleConnect = function(userId) {
	 // Push new user to lobby if length is less than 2
	if(lobby.length >= 0 && lobby.length < 2 && room.length === 0) {
		lobby.push(userId)
		
		if(lobby.length === 2) {
			// push first two players from lobby into gameroom
			room.push(lobby[0], lobby[1])
 
			// get opponent in room
			const opponent = room.find(user => user != userId)
	
			// remove two first players from lobby
			lobby.splice(0, 2);

			// determine who starts by random
			const startingPlayer = randomPlayerStart(userId, opponent)
			const secondPlayer = room.find(user => user != startingPlayer)
	
			// emit to players who starts
			io.to(startingPlayer).emit("game:playerTurn", startingPlayer)
			// io.to(secondPlayer).emit("game:playerWaiting")
			
			io.emit("game:start")
		}
	} else {
		 // wait for ongoing game to end
		 debug('There is already an ongoing game')
		 return
	}
}
 
 /**
  * Handle room reset button
  * (for dev, delete later)
  */
 const handleResetRoom = (socketId) => {
	// if (room.length > 1) {
	// 	room = [];
	// } 
	io.to(socketId).emit("reset:ships")

	const opponent = room.find(user => user != socketId)
	io.to(opponent).emit("reset:ships")

	room = []
 }

 const handleResetRoomLol = (socketId) => {
	 io.to(socketId).emit("reset:ships")
	 
	 const opponent = room.find(user => user != socketId)
	 io.to(opponent).emit("reset:ships")
	 
	 room = []
 }
 
 /**
  * Handle a user disconnecting
  */
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);

	// find socketId in room, if not do nothing
	const disconnectedPlayer = room.find(user => user === this.id)
	debug('player who disconnected: ', disconnectedPlayer)

	// if player was in room
	if(disconnectedPlayer !== undefined) {
		handleResetRoom(disconnectedPlayer)
	} else {
		return
	}
}
 
 /**
  * Handle a user click and hit/miss response
  */
 const handleUserClickBox = function(socketId, boxId)  {
	 debug("Användare klickade på en ruta")
 
	 // convert from opponent ID to ID (oa5 => a5)
	 const convBoxId = boxId.slice(1)
 
	 // find opponent in room
	 const opponent = room.find(user => user != socketId)
 
	 // emit question to opponent
	 io.to(opponent).emit('user:hitormiss', socketId, convBoxId)
 }
 
 const handleClickResponse = function(socketId, boxId, hit) {
	 const opponent = room.find(user => user != socketId)
 
	 io.to(socketId).emit('response:hitormiss', socketId, boxId, hit)
	 io.to(opponent).emit('opponentClick:respons', socketId, boxId, hit)
 }
 
 const handleNextPlayer = function(socketId) {
	 const opponent = room.find(user => user != socketId)
	 io.to(opponent).emit('game:playerTurn')
 }
 
 const handleSendShipSunk = (socketId) => {
	 const opponent = room.find(user => user != socketId)
	 io.to(socketId).emit('sending:ship:sunk:to:opponent')
	 io.to(opponent).emit('your:ship:sunk', socketId)
 } 

 const handleNoShipsLeft = (socketId) => {
	const opponent = room.find(user => user != socketId)
	io.to(socketId).emit('opponent:have:no:ships:left')
	io.to(opponent).emit('you:lost')
 }
 
 /**
  * Export controller and attach handlers to events
  */
 module.exports = function(socket, _io) {
	 // save a reference to the socket.io server instance
	 io = _io;
 
	 debug(`Client ${socket.id} connected :)`)
 
	 // listen to room reset (for dev, delete later) 
	 socket.on("reset:room", handleResetRoomLol);
 
	 // listen to user connect
	 socket.on('user:connect', handleConnect);
 
	 // handle user disconnect
	 socket.on('disconnect', handleDisconnect);
 
	 // listen to user:click
	 socket.on('user:click', handleUserClickBox)
 
	 // listen to user:click
	 socket.on('click:response', handleClickResponse)
 
	 socket.on('game:nextPlayer', handleNextPlayer)
 
	 socket.on('send:ship:sunk:to:opponent', handleSendShipSunk)

	 socket.on('player:has:no:ships:left', handleNoShipsLeft)
 }