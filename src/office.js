var Schedule   = require('node-schedule');
var sprintf    = require('yow/sprintf');
var random     = require('yow/random');
var Timer      = require('yow/timer');
var suncalc    = require('suncalc');
var tellstick  = require('./tellstick.js');

var Module = function() {

	var _active = true;
	var _lightSwitch = tellstick.getDevice('FK-01-01');
	var _motionSensor = tellstick.getDevice('RV-01');
	var _matrixTimer         = new Timer();
	var _lightSwitchTimer    = new Timer();
	var _matrix              = require('./matrix-64x32.js');


	function debug(msg) {
		console.log(msg);
	}


	function enableTimer() {
		var timer = [];

		timer.push({time:sprintf('%02d:%02d', random(20, 21), random(0, 59)), state:'ON'});
		timer.push({time:sprintf('%02d:%02d', random(0, 1),   random(0, 59)), state:'OFF'});

		_lightSwitch.setTimer(timer);
	}

	function setActive(value) {

		// Cancel pending turn-off-timer
		_lightSwitchTimer.cancel();

		if (value) {
			console.log('Lights activated in office.');

			_active = true;
			_matrix.startAnimations();
		}
		else {
			console.log('Lights deactivated in office.');

			_active = false;
			_matrix.stopAnimations();

			// Turn on again after some time
			_matrixTimer.setTimer(1000 * 60 * 60 * 8, function() {
				setActive(true);
			});

		}
	};

	function listen() {
		_lightSwitch.on('ON', function() {
			setActive(true);
		});

		_lightSwitch.on('OFF', function() {
			setActive(false);
		});

		_motionSensor.on('ON', function() {
			// Make sure we don't get too many events at once
			_motionSensor.pauseEvents(5000);

			if (_active) {
				console.log('Movement in the office...');

				var position = suncalc.getPosition(new Date(),  55.7, 13.1833333);

				if (position.altitude < 0.1) {

					_lightSwitch.turnOn();

					_lightSwitchTimer.setTimer(1000 * 60 * 60 * 1, function() {
						_lightSwitch.turnOff();
					});

				};

			}

		});

	}


	function run() {

		console.log('Office active.');

		tellstick.socket.once('connect', function() {

			var rule    = new Schedule.RecurrenceRule();
			rule.hour   = 0;
			rule.minute = 0;

			Schedule.scheduleJob(rule, function() {
				enableTimer();
			});

			enableTimer();
			listen();

		});

	}

	run();
}

module.exports = new Module();
