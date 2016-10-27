var Schedule = require('node-schedule');
var sprintf  = require('yow').sprintf;
var suncalc  = require('suncalc');

var tellstick  = require('./tellstick.js');


var Module = module.exports = function() {

	var _motionSensor   = tellstick.getDevice('RV-02');
	var _masterSwitch   = tellstick.getDevice('FK-02-01');
	var _delay          = 1000 * 60 * 30;
	var _timer          = null;
	var _lightsActive   = true;


	function debug(msg) {
		console.log(msg);
	}


	function listen() {
		debug('Listening for events in cellar...');

		function setTimer() {

			if (_timer != null)
				clearTimeout(_timer);

			_timer = setTimeout(function() {
				_masterSwitch.setState('OFF');
			}, _delay);
		}

		_motionSensor.on('ON', function() {
			if (_lightsActive) {
				_masterSwitch.turnOn();

				setTimer();

				debug('Timer started in cellar. Lights should now be on. Turning off cellar light in 30 minutes.');
			}
			else {
				debug('Movement detected in cellar but ignoring.');
			};
		});


		_masterSwitch.on('ON', function() {
			_lightsActive = true;
			debug('Motion sensor lights active in cellar.');
		});

		_masterSwitch.on('OFF', function() {
			_lightsActive = false;
			debug('Motion sensor lights deactivated in cellar.');
		});


	}

	function run() {

		// Turn off lights
		_masterSwitch.setState('OFF');

		// Start to listen after a while
		setTimeout(listen, 3000);

	}

	run();
}
