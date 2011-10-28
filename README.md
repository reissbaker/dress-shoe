DRESS SHOE
==========

An wrapper around and extension of [SockJS](http://sockjs.org), allowing for
cross-browser namespaced channels of communication and cookie-based authorization
using WebSockets and NodeJS.

Requires sockjs-node on the server, and sockjs-client clientside.

SERVER API
----------
* `dressShoe(sockjs_opts)` creates the server, where `sockjs_opts` is a hash of sockjs-node's options.
* `server.authorize(callback)` adds an authorization handler to the server, where the `callback` is of the form
`function(connection, cookies, accept)`. Calling `accept()` or `accept(true)` accepts the connection, and calling
`accept(false)` rejects it.
* `server.on(event, callback)` adds an event handler to the server. The only event the server emits is `"connection"`, 
which it emits upon a new connection opening. Callbacks for `"connection"` handlers should be of the form
`function(connection)`.
* `connection.readyState()` tests whether the connection is ready.
* `connection.on(callback)` adds an event handler to a connection. Connections emit `"data"` and `"close"` events; the
former is emitted on new incoming data, and the latter is emitted on a close event. Both take handlers of the form
`function(data)`.
* `connection.write(message)` writes a message to a socket on the default channel.
* `connection.close()` manually closes a socket. This is only necessary if you want to close a socket before it's
ready to close -- if it closes itself (either through calling close() on the client or timing out), the server
closes the connection by itself and emits a `"close"` event.
* `connection.channel(channelName)` creates or accesses a named channel on the connection, and returns it. Channels
are exactly the same as connections, but they can't `close()` or `clear()`. They will, however, emit `"close"` events
if the connection gets closed. Channels are namespaced -- writing something on a `"ninjaTurtle"` channel bypasses the
default channel, and a message sent on the `"donatello"` channel won't get picked up by the `"raphael"` channel (or the
default channel).
* `connection.clear(channelName)` manually removes a channel. This is only necessary if you're making lots of short-lived
channels on a long-lived connection; otherwise, just rely on the fact that channels are GCed at the same time as their
parent connections.

CLIENT API
----------
* `dressShoe(url, protocol, options)`
* `connection.readyState()`
* `connection.on(event, callback)`
* `connection.write(message)`
* `connection.close()`
* `connection.channel(channelName)`
* `connection.clear(channelName)`
