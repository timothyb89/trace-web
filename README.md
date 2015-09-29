# trace-web
A realtime WebGL-based viewer for [trace](https://github.com/timothyb89/trace/).

It consists of two parts:
 * A WebGL client that displays models in the browser
 * A small server that translates raw socket input from the trace app to
   websocket messages (and also does some basic caching)

The server is designed to minimize dependencies for the client application, so
communicating with it should only require standard library functions. The only
possible exception is Base64, though implementations can be found for just about
any language.

Requirements
------------
Node and NPM are required to run the server. To view, you'll need a browser
with decent WebGL support. Clients can be written in any language, though the
example implementation ([`trace`](https://github.com/timothyb89/trace/)) is
written in Java 8.

Usage
-----
 1. Clone the repository
 2. Run `npm install` to install server dependencies
 3. Run `node app.js` to start the server
 4. Browse to http://localhost:4000/
 5. Connect a client (like `trace`) to the socket running on port 4001
 6. Do things in the client, and watch them render in the browser window

Specifically for the `trace` client, you can use this viewer with the
`ModelREPL` to preview the current state of the transformation. As you apply
different transforms, the current state of the model will be computed in the
background and synchronized with your browser.

Protocol
--------
The protocol is designed to be exceedingly simple, and can easily be used by
other raytracers. Client applications connect to the server using a plain TCP
socket and send commands as lines of ASCII text (terminated with `\n`).

The commands are as follows:
 * `model [name] [data]` - add the model to the scene with the given name.
   * `name` - a unique name identifying the model, will replace any existing
     models with the same name
   * `data` - a Base64-encoded ASCII PLY model.
 * `remove [name]` - remove the model with the given name from the scene
 * `clear` - remove all models from the scene

For an example implementation, see
[WebSync from trace](https://github.com/timothyb89/trace/blob/master/src/main/java/org/timothyb89/trace/util/WebSync.java).
Note that this implementation does a few things for performance/sanity reasons
that aren't strictly required:
 * Uses a wrapper for conditional computation, so no expensive operations will
   need to be run if the socket isn't connected (the `Supplier` in `m()`)
 * Uses a background thread for expensive computation, PLY generation, and
   socket output (see `m(name, supplier)` and the `ExecutorService`)


Future
------
In addition to the WebGL scene viewer, there will be a canvas-based image viewer
to show the result of traces in realtime.
