var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var Schedule     = require('node-schedule');
var sprintf      = require('yow').sprintf;
var random       = require('yow').random;
var isFunction   = require('yow').isFunction;
var suncalc      = require('suncalc');

var tellstick  = require('./tellstick.js');

var Timer = function() {

	var _this = this;
	var _timer = undefined;

	_this.cancel = function() {
		if (_timer != undefined)
			clearTimeout(_timer);

		_timer = undefined;
	};

	_this.setTimer = function(delay, fn) {
		if (delay == undefined)
			delay = 3000;

		if (_timer != undefined)
			clearTimeout(_timer);

		_timer = setTimeout(fn, delay);

	};

};


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
			console.log('Motion sensor deactivated in cellar.');

			_autoActivationTimer.setTimer(1000 * 60 * 60 * 8, function() {

				if (!_lightsActive) {
					console.log('Motion sensor in cellar is active again');
					_lightsActive = true;
				}
			});
		});


	}

	function enableAutoActivation() {
		var rule    = new Schedule.RecurrenceRule();
		rule.hour   = 8;
		rule.minute = 0;

		Schedule.scheduleJob(rule, function() {
			if (!_lightsActive) {
				_lightsActive = true;
				console.log('Motion sensor reactivated in cellar.');
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
