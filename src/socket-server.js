var Schedule    = require('node-schedule');
var sprintf     = require('yow/sprintf');
var tellstick   = require('./tellstick.js');

var Module = function(argv) {

	this.socket = undefined;

	function listen() {

		var app = require('http').createServer(function(){});
		var io = require('socket.io')(app);


		app.listen(argv.port, function() {
			console.log('Listening on port', argv.port, '...');
		});

		io.on('connection', function(socket) {

			console.log('Connection from', socket.id);

			socket.on('disconnect', function() {
				console.log('Disconnected from', socket.id);
			});

			socket.on('setState', function(params) {
				console.log('setState', params);

				if (params && params.device && params.state)
					tellstick.turnOn(params.device, params.state);
				else {
					console.log('Invalid parameters to light-service');
				}
			});

			socket.on('getState', function(params) {
				console.log('getState', params);
			});

			socket.on('hello', function(data) {
				socket.emit('hello');
				console.log('hello');
			})

		});
	}


	function run() {

		console.log('Socket service active.');

		listen();


		tellstick.socket.once('connect', function() {
		});


	}

	run();
}

module.exports = Module;
