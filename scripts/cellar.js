var Schedule = require('node-schedule');
var sprintf  = require('yow').sprintf;
var random   = require('yow').random;
var suncalc  = require('suncalc');

var tellstick  = require('./tellstick.js');


var Module = function() {

	var _motionSensor   = tellstick.getDevice('RV-02');
	var _masterSwitch   = tellstick.getDevice('FK-02-01');
	var _frontLights    = tellstick.getDevice('FK-02-02');
	var _backLights     = tellstick.getDevice('FK-02-03');

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

			// Make sure we don't get too many events at once
			_motionSensor.pauseEvents(10000);

			if (_lightsActive) {
				_masterSwitch.turnOn();

				setTimer();

				debug('Timer started in cellar. Lights should now be on.');
			}
			else {
				debug('Movement detected in cellar but ignoring.');
			};
		});


		_masterSwitch.on('ON', function() {
			_lightsActive = true;
			debug('Motion sensor active in cellar.');
		});

		_masterSwitch.on('OFF', function() {
			_lightsActive = false;
			debug('Motion sensor deactivated in cellar.');
		});


	}

	function enableAutoActivation() {
		var rule    = new Schedule.RecurrenceRule();
		rule.hour   = 8;
		rule.minute = 0;

		Schedule.scheduleJob(rule, function() {
			if (!_lightsActive) {
				_lightsActive = true;
				debug('Motion sensor reactivated in cellar.');
			};
		});

	};

	function enableTimer() {
		var timer = [];

		timer.push({time:sprintf('%02d:%02d', random(22, 23), random(0, 59)), state:'ON'});
		timer.push({time:sprintf('%02d:%02d', random(2, 3),   random(0, 59)), state:'OFF'});

		_frontLights.setTimer(timer);
		_backLights.setTimer(timer);
	}


	function run() {

		console.log('Cellar active.');

		tellstick.socket.once('connect', function() {

			// Enable timer
			enableTimer();

			// Make sure motion sensor is activated after it is deactivated
			enableAutoActivation();

			// Start monitoring
			listen();

		});

	}

	setTimeout(run, 0);

}

module.exports = new Module();
