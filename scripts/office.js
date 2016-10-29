var Schedule = require('node-schedule');
var sprintf  = require('yow').sprintf;
var random  = require('yow').random;
var suncalc  = require('suncalc');

var tellstick  = require('./tellstick.js');
var matrix = require('socket.io-client')('http://app-o.se:3000/matrix-display');

var Module = module.exports = function() {

	var _lightSensor    = tellstick.getDevice('SR-01');
	var _lightSwitch    = tellstick.getDevice('FK-01-01');
	var _motionSensor   = tellstick.getDevice('RV-01');

	function debug(msg) {
		console.log(msg);
	}


	function listen() {
		function setTimer() {

			if (_timer != null)
				clearTimeout(_timer);

			_timer = setTimeout(function() {
				_masterSwitch.setState('OFF');
			}, _delay);
		}

		tellstick.getDevice('FK-01-03').on('OFF', function() {
			matrix.emit('stop', {});

		});

		tellstick.getDevice('FK-01-03').on('ON', function() {
			matrix.emit('text', {text:'low', priority:'low'});

		});

		_motionSensor.on('ON', function() {
			console.log('Motion detected on RV-01.')
			matrix.emit('animation', {priority:'low', duration:60, name:random(['tree','pacman','pong','boat','fireplace','reduction'])});
		});




		_lightSensor.on('ON', function() {
			debug('Getting darker, turning on lights...');
			_lightSwitch.turnOn();
		});

		_lightSensor.on('OFF', function() {
			debug('Getting brighter, turning off lights...');
			_lightSwitch.turnOff();
		});

	}

	function run() {

		listen();
	}

	run();
}
