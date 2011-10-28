var events, sock, connection, channel, allChannels; 

events = require('events');
sock = require('sockjs');

/*
 * Emitter decorator function.
 * Returns an emitter that emits
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

	emitter.write = function(data) {
		conn.write(JSON.stringify({type:chan, data:data}));
	};

	emitter.channel = function(childChannel) {
		return channel(conn, allChannels, chan + '/' + childChannel);
	};

	conn.on('data', function(data) {
		if(typeof data.type !== 'undefined' && typeof data.type === 'string') {
			emitter.emit('data', data.data);
		} else if(typeof data.type === 'undefined' &&  typeof chan === 'data') {
			emitter.emit('data', data.data);
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
	var emitter = channel(conn, allChannels, 'data');

	// only the main connection is allowed
	// to force a close event.
	emitter.close = function() {
		conn.close.apply(conn, arguments);
	};

	// only the main connection is allowed to clear channels
	emitter.clear = function(chan) {
		if(allChannels['data/' + chan])
			delete allChannels['data/' + chan];
	};

	return emitter;
};

/*
 * Wraps a server.
 */

exports = module.exports = function(options) {
	var sockserver = sock.createServer(options);
	var emitter = new events.EventEmitter();

	var handshake = function(conn, cookies, callback) {
		callback(true);
	};

	var combineHandshakes = function(h1, h2) {
		return function(conn, cookies, callback) {
			h1(cookies, conn, function(accepted) {
				if(typeof accepted === 'undefined' || accepted)
					h2(conn, cookies, callback);
				else
					callback(false);
			});
		};
	};

	emitter.installHandlers = function(http, options) {
		sockserver.installHandlers(http, options);
	};
	emitter.authorize = function(callback) {
		handshake = combineHandshakes(handshake, callback);
	};

	sockserver.on('connection', function(conn) {
		var wrapped = connection(conn);
		var hcallback = function(data) {
			if(typeof data.type === 'string' && data.type === 'handshake') {	
				handshake(wrapped, data.data, function(accepted) {
					if(accepted) {
						conn.removeListener('data', hcallback);
						emitter.emit('connection', wrapped, data.data);
					} else
						conn.close();
				});
			}
		};
		conn.on('data', hcallback);
	});

	return emitter;
};
