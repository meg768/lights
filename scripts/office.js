var Schedule   = require('node-schedule');
var sprintf    = require('yow').sprintf;
var random     = require('yow').random;
var suncalc    = require('suncalc');
var tellstick  = require('./tellstick.js');

var Module = module.exports = function() {

	var _lightSensor    = tellstick.getDevice('SR-01');
	var _lightSwitch    = tellstick.getDevice('FK-01-01');

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
