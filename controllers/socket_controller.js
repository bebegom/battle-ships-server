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
 * 
 */

// randomize what player that starts
const randomPlayerStart = (userId, opponent) => {
	const randomNumber = (max) => {
		return Math.floor(Math.random() * max)
	}

	if (randomNumber(11) <= 5) {
		//player one start
		// io.to(userId).emit("game:yourturn")
		return userId 
	} else {
		//player two start
		// io.to(opponent).emit("game:wait") 
		return opponent
	}
}


/**
 * Handle a user connecting
 *
 */
const handleConnect = (userId) => {
	// debug(`Client ${userId} clicked submit :O`);

	// Push new user to lobby
	lobby.push(userId)

	// Check if a game already is ongoing and another user is in lobby
	if (!room.length && lobby.length === 2) {

		// push first two players from lobby into gameroom
		room.push(lobby[0], lobby[1])

		// find opponent
		const opponent = room.find(user => user = !this.id)

		// remove two first players from lobby
		lobby.splice(0, 2);
	
		// determine who starts by random
		const startingPlayer = randomPlayerStart(userId, opponent)
		const secondPlayer = room.find(user => user = !startingPlayer)

		// emit to players who starts
		io.to(startingPlayer).emit("game:playerTurn")
		io.to(secondPlayer).emit("game:playerWaiting")
	} else {
		// wait for ongoing game to end
		debug('Wait for game.')
	}

	debug(room)
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
 *
 */
 const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);
}

/**
 * Handle a user click and hit/miss response
 *
 */
const handleUserClickBox = (socketId) => {
	const opponent = room.find(user => user = !socketId)
	io.to(opponent).emit('user:hitormiss', socketId)
}

const handleClickResponse = (socketId, hit) => {
	io.to(socketId).emit('respons:hitormiss', socketId, hit)
}





/**
 * Export controller and attach handlers to events
 *
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
}
