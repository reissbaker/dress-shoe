(function(window, SockJS) {
	var Channel = function(sock, allChannels, channel) {
		this.on = this.addListener = function(type, handler) {
			if(type === 'data') {
				sock.addEventListener('message', function(data) {
					data = JSON.parse(data.data);
					if(typeof data.type !== 'undefined' && data.type === channel)
						handler(data.data);
					else if(typeof data.type === 'undefined' && channel === 'data') {
						if(typeof data.data !== 'undefined')
							handler(data.data);
						else
							handler(data);
					}
				});	
			} else if(type === 'connection') {
				sock.addEventListener('open', handler); // new SockJS API isn't on client yet -- needs emulation
			} else {
				sock.addEventListener(type, handler);
			}
		};
		
		this.send = function(data) {
			sock.send({type:channel, data:data});
		};

		this.channel = function(chan) {
			var c = channel + '/' + chan;
			if(typeof allChannels[c] !== 'undefined')
				return allChannels[c];
			return new Channel(sock, allChannels, c);
		};

		this.removeListener = function(channel, handler) {
			sock.removeEventListener(channel, handler);
		};

		this.readyState = function() {
			return sock.readyState;
		};
	};
	window.dressShoe = function() {
		var url, protocol, options, args, channel, allChannels, sock;
		args = Array.prototype.slice.call(arguments);
		if(args.length === 3) {
			url = args[0];
			protocol = args[1];
			options = args[2];
		} else if(args.length === 2) {
			url = args[0];
			if(args[1] instanceof Array) {
				protocol = args[1];
				options = undefined;
			} else {
				protocol = undefined;
				options = args[1];
			}
		} else {
			url = args[0];
			protocol = options = undefined;
		}


		allChannels = {};
		sock = new SockJS(url, protocol, options);
		sock.addEventListener('open', function() {
			sock.send({type:'handshake', data:document.cookie});
		});

		channel = new Channel(sock, {}, 'data');

		// only priveleged channels can close
		channel.close = function(code, reason) {
			sock.close(code, reason);
		};

		// only priveleged channels can clear
		channel.clear = function(chan) {
			if(typeof allChannels['data/' + chan] !== 'undefined')
				delete allChannels['data/' + chan];
		};

		channel.protocol = function() {
			return sock.protocol;
		};

		return channel;
	};
}(window, SockJS));
