var express = require('express');
var path = require('path');
var http = require('http');
var net = require('net');
var carrier = require('carrier');
var morgan = require('morgan');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

if (typeof String.prototype.startsWith != 'function') {
	// see below for better implementation!
	String.prototype.startsWith = function (str){
		return this.indexOf(str) === 0;
	};
}

var modelCache = {};

server.listen(4000);

app.use(morgan('combined'));
app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket) {
	for (var model in modelCache) {
		console.log("Sending cached model:", model);

		socket.emit('command', modelCache[model]);
	}
});

net.createServer(function(socket) {
	var c = carrier.carry(socket);
	c.on('line', function(line) {
		console.log(typeof line);
		if (line.toString().startsWith("model")) {
			var tokens = line.toString().split(" ", 3);
			console.log("caching model: ", tokens[1]);
			modelCache[tokens[1]] = line;
		}

		if (line.toString().startsWith("clear")) {
			console.log("clearing cache");
			modelCache = {};
		}

		//console.log("Sending line: ", line)
		io.emit('command', line);
	});
}).listen(4001);
