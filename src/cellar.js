var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var Schedule     = require('node-schedule');
var sprintf      = require('yow').sprintf;
var random       = require('yow').random;
var isFunction   = require('yow').isFunction;
var suncalc      = require('suncalc');
var Timer        = require('yow/timer');

var tellstick  = require('./tellstick.js');



var Module = function() {

	var _motionSensor   = tellstick.getDevice('RV-02');
	var _masterSwitch   = tellstick.getDevice('FK-02-01');
	var _frontLights    = tellstick.getDevice('FK-02-02');
	var _backLights     = tellstick.getDevice('FK-02-03');

	var _turnOffTimer        = new Timer();
	var _autoActivationTimer = new Timer();

	var _lightsActive = true;


	function listen() {
		console.log('Listening for events in cellar...');

		_motionSensor.on('ON', function() {

			// Make sure we don't get too many events at once
			_motionSensor.pauseEvents(10000);

			if (_lightsActive) {
				_masterSwitch.turnOn();

				// Turn off in 30 minutes
				_turnOffTimer.setTimer(1000 * 60 * 30, function() {
					console.log('Turning off lights in cellar.');
					_masterSwitch.turnOff();
				});

				console.log('Timer started in cellar. Lights should now be on.');
			};
		});


		_masterSwitch.on('ON', function() {
			_lightsActive = true;
			console.log('Motion sensor active in cellar.');
		});

		_masterSwitch.on('OFF', function() {
			_lightsActive = false;
			console.log('Motion sensor deactivated in cellar. Activating again in 8 hours.');

			_autoActivationTimer.setTimer(1000 * 60 * 60 * 8, function() {

				if (!_lightsActive) {
					console.log('Motion sensor in cellar is active again');
					_lightsActive = true;
				}
			});
		});


	}


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

			// Start monitoring
			listen();

		});

	}

	setTimeout(run, 0);

}

module.exports = new Module();
