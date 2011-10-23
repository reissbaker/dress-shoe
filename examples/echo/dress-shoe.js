(function(window, SockJS) {
	var Channel = function(sock, allChannels, channel) {
		this.on = this.addEventListener = function(type, handler) {
			if(type === 'message') {
				sock.addEventListener(type, function(data) {
					data = JSON.parse(data.data);
					console.log(data);
					if(typeof data.type !== 'undefined' && data.type === channel)
						handler(data.data);
					else if(typeof data.type === 'undefined' && channel === 'message') {
						if(typeof data.data !== 'undefined')
							handler(data.data);
						else
							handler(data);
					}
				});	
			} else {
				sock.addEventListener(type, handler);
			}
		};
		
		this.send = function(data) {
			sock.send({type:channel, data:data});
			console.log(channel + ': ' + data);
		};

		this.channel = function(chan) {
			var c = channel + '/' + chan;
			if(typeof allChannels[c] !== 'undefined')
				return allChannels[c];
			return new Channel(sock, allChannels, c);
		};

		this.removeEventListener = function(channel, handler) {
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
		channel = new Channel(sock, {}, 'message');

		// only priveleged channels can close
		channel.close = function(code, reason) {
			sock.close(code, reason);
		};

		// only priveleged channels can clear
		channel.clear = function(chan) {
			if(typeof allChannels['message/' + chan] !== 'undefined')
				delete allChannels['message/' + chan];
		};

		channel.protocol = function() {
			return sock.protocol;
		};

		return channel;
	};
}(window, SockJS));
