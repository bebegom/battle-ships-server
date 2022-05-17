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
				hp: 4
			},
			cruiser: {
				hp: 3
			},
			submarine: {
				hp: 2
			},
			destroyer: {
				hp: 2
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

			const player1 = room[0];
			const player2 = room[1];

			const activeUser = room.find(user => user = userId)
			const opponent = room.find(user => user = !userId)

			// emit to users in room
			io.to(userId).emit('game:start', activeUser)


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
