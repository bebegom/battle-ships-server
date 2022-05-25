/**
 * Socket Controller
 */

const { emit } = require('nodemon');

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
	// Push new user to lobby
	lobby.push(userId)

	// Check if a game already is ongoing and another user is in lobby
	if (!room.length && lobby.length === 2) {

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

	} else {
		// wait for ongoing game to end
		debug('Wait for game.')
	}
}

/**
 * Handle room reset button
 * (for dev, delete later)
 */
const handleResetRoom = () => {
	room = [];
}

/**
 * Handle a user disconnecting
 */
 const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);
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
	// io.to(socketId).emit('sending:ship:sunk:to:opponent')
	io.to(opponent).emit('your:ship:sunk', socketId)
} 

const handleUpdateMyShipsToOpponent = (socketId, shipsLeft) => {
	const opponent = room.find(user => user != socketId)
	io.to(socketId).emit('update:opponent:amount:of:ships', shipsLeft)
}

/**
 * Export controller and attach handlers to events
 */
module.exports = function(socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	debug(`Client ${socket.id} connected :)`)

	// listen to room reset (for dev, delete later) 
	socket.on("reset:room", handleResetRoom);

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

	socket.on('send:my:amount:of:ships:to:opponent', handleUpdateMyShipsToOpponent)
}
