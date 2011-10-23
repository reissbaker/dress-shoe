DRESS SHOE
==========

An wrapper around and extension of [SockJS](http://sockjs.org), allowing for
namespaced channels of communication and cookie-based authorization.

Requires sockjs-node on the server, and sockjs-client clientside.

SERVER API
----------
* `dressShoe(sockjs_opts)`
* `server.authorize(callback)`
* `server.on(event, callback)`
* `connection.readyState()`
* `connection.on(callback)`
* `connection.send(message)`
* `connection.close()`
* `connection.channel(channelName)`
* `connection.clear(channelName)`

CLIENT API
----------
* `dressShoe(url, protocol, options)`
* `connection.readyState()`
* `connection.on(event, callback)`
* `connection.send(message)`
* `connection.close()`
* `connection.channel(channelName)`
* `connection.clear(channelName)`
