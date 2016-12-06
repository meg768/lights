var Schedule    = require('node-schedule');
var sprintf     = require('yow/sprintf');
var suncalc     = require('suncalc');
var tellstick   = require('./tellstick.js');

var Module = function() {

	var _switch = tellstick.getDevice('VS-03');

	function getSunTime(name) {
		var suntimes = suncalc.getTimes(new Date(), 55.7, 13.1833333);
		return new Date(suntimes[name]);
	}

	function turnOnTime() {
		var sunset = getSunTime('sunset');

		return new Date(sunset.valueOf() - 1000 * 60 * 60 * 3);
	}

	function turnOffTime() {
		var sunrise = getSunTime('sunrise');

		return new Date(sunrise.valueOf() + 1000 * 60 * 60 * 2);
	}

	function getOnOffTimes() {


		var times = [
			{state:'ON',  time:turnOnTime()},
			{state:'OFF', time:turnOffTime()}
		];

		return times;
	}

	function run() {

		console.log('Dining room active.');

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
