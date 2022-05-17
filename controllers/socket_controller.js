/**
 * Socket Controller
 */

const { emit } = require('nodemon');

const debug = require('debug')('clock:socket_controller');
let io = null; // socket.io server instance

let room = []

const lobby = []


/**
 * Handle a user connecting
 *
 */
const handleConnect = (userId) => {
	// debug(userId)
	debug(`Client ${userId} clicked submit :O`);

	// Create player
	const playerTemplate = {
		id: userId,
		ships: {
			battleship: {
				squares: {1: true, 2: true, 3: true, 4: true},
				position: {x: 0, y: 0}
			},
			cruiser: {
				squares: {1: true, 2: true, 3: true},
				position: {x: 0, y: 0}

			},
			submarine: {
				squares: {1: true, 2: true,},
				position: {x: 0, y: 0}
			},
			destroyer: {
				squares: {1: true, 2: true,},
				position: {x: 0, y: 0}
			}
		}
	}

	// Push new user to lobby
	lobby.push(playerTemplate)
	debug(room)

	// Check if a game already is ongoing
	if (!room.length) {
		// check if another user is in lobby
		if (lobby.length === 2) {
			room.push(lobby[0], lobby[1])

			lobby.splice(0, 2);
		}
	
	} else {
		// wait for ongoing game to end
	}


	// Start game

	// If more than two players => push to lobby




}

/**
 * Handle a user disconnecting
 *
 */
 const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);
}


/**
 * Export controller and attach handlers to events
 *
 */
module.exports = function(socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	debug(`Client ${socket.id} connected :)`)

	
	socket.on('user:connect', handleConnect);

	// handle user connect
	socket.on('connection', handleConnect)

	// handle user disconnect
	socket.on('disconnect', handleDisconnect);
}
