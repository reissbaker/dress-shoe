DRESS SHOE
==========

A simple extension of [SockJS](http://sockjs.org), allowing for namespaced channels of communication.

Requires sockjs-node on the server, and sockjs-client clientside.

SERVER API
----------
* `dressShoe(sockjs_opts)`
* `server.on(event, callback)`
* `server.authorize(callback)`
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
