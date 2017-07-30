var Schedule   = require('node-schedule');
var sprintf    = require('yow/sprintf');
var random     = require('yow/random');
var Timer      = require('yow/timer');

var tellstick  = require('./tellstick.js');


function Lamp() {

	var _this = this;
	var _socket = require('socket.io-client')('http://app-o.se/neopixel-lamp');


	_this.colorize = function(options) {

		return new Promise(function(resolve, reject) {
			_socket.emit('colorize', options, function() {
				resolve();
			});
		});
	};

	_this.pause = function(ms) {
		return new Promise(function(resolve, reject) {
			setTimeout(resolve, ms);
		});
	};

	_this.fadeToColor = function(red, green, blue, duration) {
		var options = {};
		options.red = red;
		options.green = green;
		options.blue = blue;
		options.duration = duration == undefined ? 200 : duration;
		options.transition = 'fade';

		return _this.colorize(options);
	};



};

var Module = function() {

	var _motionSensor = tellstick.getDevice('RV-01');
	var _lamp = new Lamp();

	function debug(msg) {
		console.log(msg);
	}




	function listen() {

		_motionSensor.on('ON', function() {
			// Make sure we don't get too many events at once
//			_motionSensor.pauseEvents(1000);
			console.log('Movement in the office...');

			_lamp.fadeToColor(128, 128, 128, 10).then(function() {
				return _lamp.pause(0);
			})
			.then(function() {
				return _lamp.fadeToColor(0, 0, 0, 10);
			})
			.then(function() {
				console.log('Done!');

			})
			.catch(function(error) {
				console.log(error);
			});

		});

	}


	function run() {

		console.log('Lamp active.');

		listen();

	}

	run();
}

module.exports = new Module();
