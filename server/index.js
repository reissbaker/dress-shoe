var events, sock, connection, channel, allChannels; 

events = require('events');
sock = require('sockjs');

/*
 * Emitter decorator function.
 * Returns an emitter than emits
 * things based on the provided
 * channel.
 */

channel = function(conn, allChannels, chan) {
	// if the channel already exists, return it.
	if(allChannels[chan])
		return allChannels[chan];

	//otherwise, build it.
	var emitter = new events.EventEmitter();
	allChannels[chan] = emitter;

	emitter.readyState = function() {
		return conn.readyState;
	};

	emitter.send = function(message) {
		conn.send(JSON.stringify({type:chan, data:message}));
	};

	emitter.channel = function(childChannel) {
		return channel(conn, allChannels, chan + '/' + childChannel);
	};

	conn.on('message', function(data) {
		data = data.data;
		if(typeof data.type !== 'undefined' && typeof data.type === 'string') {
			emitter.emit('message', data.data);
		} else if(typeof data.type === 'undefined' &&  typeof chan === 'message') {
			emitter.emit('message', data.data);
		}
	});

	conn.on('close', function(event) {
		emitter.emit('close', event);
	});

	return emitter;
};

/*
 * Wraps a connection, returns a priveleged default channel.
 */

connection = function(conn) {
	var allChannels = {};
	var emitter = channel(conn, allChannels, 'message');

	// only the main connection is allowed
	// to force a close event.
	emitter.close = function() {
		conn.close.apply(conn, arguments);
	};

	// only the main connection is allowed to clear channels
	emitter.clear = function(chan) {
		if(allChannels['message/' + chan])
			delete allChannels['message/' + chan];
	};

	return emitter;
};

/*
 * Wraps a server.
 */

exports = module.exports = function(options) {
	var sockserver = new sock.Server(options);
	var emitter = new events.EventEmitter();
	emitter.installHandlers = function(http, options) {
		sockserver.installHandlers(http, options);
	};

	sockserver.on('open', function(conn) {
		emitter.emit('open', connection(conn));
	});

	return emitter;
};
