var Schedule   = require('node-schedule');
var sprintf    = require('yow').sprintf;
var random     = require('yow').random;
var suncalc    = require('suncalc');
var tellstick  = require('./tellstick.js');

var Module = function() {

	var _lightSensor    = tellstick.getDevice('SR-01');
	var _lightSwitch    = tellstick.getDevice('FK-01-01');

	function debug(msg) {
		console.log(msg);
	}

	function today() {

		return new Date();
	}

	function turnOnTime() {
		var suntimes = suncalc.getTimes(today(), 55.7, 13.1833333);

		return new Date(suntimes.sunset.getTime() - 1000 * 60 * 60 * 2);
	}

	function turnOffTime() {

		return random(['01:07', '00:30', '00:50', '01:10']);

		var suntimes = suncalc.getTimes(today(), 55.7, 13.1833333);
		return new Date(suntimes.sunrise.getTime() + 1000 * 60 * 60 * 2);
	}

	function getOnOffTimes() {


		var times = [
			{state:'ON',  time:turnOnTime()},
			{state:'OFF', time:turnOffTime()}
		];

		console.log('Turning on office-room lights at', times[0].time, '...');
		console.log('Turning off office-room lights at', times[1].time, '...');


		return times;
	}


	function run() {

		console.log('Office active.')

		tellstick.socket.on('connect', function() {

			_lightSensor.on('ON', function() {
				debug('Getting darker, turning on lights...');
				_lightSwitch.turnOn();
			});

			_lightSensor.on('OFF', function() {
				debug('Getting brighter, turning off lights...');
				_lightSwitch.turnOff();
			});

			function setupTimer() {
				_lightSwitch.setTimer(getOnOffTimes());
			}


			var rule    = new Schedule.RecurrenceRule();
			rule.hour   = 0;
			rule.minute = 0;

			Schedule.scheduleJob(rule, function() {
				setupTimer();
			});

			setupTimer();

		});

	}

	run();
}

module.exports = new Module();
