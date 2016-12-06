var Schedule    = require('node-schedule');
var sprintf     = require('yow/sprintf');
var random      = require('yow/random');

var suncalc     = require('suncalc');
var tellstick   = require('./tellstick.js');

// 07:00 ON
// 10:00 OFF
// 15:30 ON
// 01:00 OFF


var Module = module.exports = function() {

	var _switch = tellstick.getDevice('VS-04');

	function getSunTime(name) {
		var suntimes = suncalc.getTimes(new Date(), 55.7, 13.1833333);
		return new Date(suntimes[name]);
	}

	function turnOnTime() {
		var sunset = getSunTime('sunset');
		return new Date(sunset.valueOf() - 1000 * 60 * 60 * 0.5);
	}

	function turnOffTime() {
		var date = new Date();

		// Midnight
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);

		// Next midnight
		date.setDate(date.getDate() + 1);

		// Switch off between 1 and 2 AM
		return new Date(date.valueOf() + (1 + random()) * (1000 * 60 * 60));
	}

	function getOnOffTimes() {

		var times = [
			{state:'ON',   time:'07:00'},
			{state:'OFF',  time:'10:00'},
			{state:'ON',   time:'15:30'},
			{state:'OFF',  time:'01:00'}
		];
/*
		var times = [
			{state:'ON',  time:turnOnTime()},
			{state:'OFF', time:turnOffTime()}
		];
		*/

		return times;
	}

	function run() {

		tellstick.socket.once('connect', function() {
			function setupTimer() {
				_switch.setTimer(getOnOffTimes());
			}

			var rule    = new Schedule.RecurrenceRule();
			rule.hour   = 3;
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
