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

		tellstick.getDevice('FK-01-03').on('ON', function() {
			console.log('Clear!');
			matrix.emit('clear', {});
		});

		_motionSensor.on('ONFF', function() {
			if (!_motionSensor.disabled) {
				_motionSensor.disabled = true;
				setTimeout(function() {
					_motionSensor.disabled = false;

				}, 60000);
				console.log('Motion detected on RV-01.')
				matrix.emit('animation', {duration:60, name:random(['tree','pacman','pong','boat','fireplace','reduction'])});

			}
		});

		_motionSensor.on('ON', function() {
			if (!_motionSensor.disabled) {
				_motionSensor.disabled = true;
				setTimeout(function() {
					_motionSensor.disabled = false;

				}, 2000);
				console.log('Motion detected on RV-01.')
				matrix.emit('emoji', {pause:1, id:random(750) + 1});

			}
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
