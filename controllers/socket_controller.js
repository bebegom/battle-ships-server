/**
 * Socket Controller
 */

const debug = require('debug')('clock:socket_controller');
let io = null; // socket.io server instance

/**
 * Handle a user disconnecting
 *
 */
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);
}

const handleClockStart = function() {
	// tell all clients to start their clock
	io.emit('clock:start')
}

const handleClockStop = function() {
	// tell all clients to stop their clock
	io.emit('clock:stop')
}

const handleClockReset = function() {
	// tell all clients to reset their clock
	io.emit('clock:reset')
}

/**
 * Export controller and attach handlers to events
 *
 */
module.exports = function(socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	debug(`Client ${socket.id} connected`)

	// handle user disconnect
	socket.on('disconnect', handleDisconnect);

	socket.on('clock:start', handleClockStart)

	socket.on('clock:stop', handleClockStop)

	socket.on('clock:reset', handleClockReset)
}
