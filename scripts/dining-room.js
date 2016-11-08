var Schedule    = require('node-schedule');
var sprintf     = require('yow').sprintf;
var suncalc     = require('suncalc');
var tellstick   = require('./tellstick.js');

var Module = function() {

	var _switch = tellstick.getDevice('VS-03');

	function today() {
		return new Date();
	}

	function turnOnTime() {
		var suntimes = suncalc.getTimes(today(), 55.7, 13.1833333);
		var sunset   = suntimes['sunset'];

		return new Date(sunset.getTime() - 1000 * 60 * 60 * 4);
	}

	function turnOffTime() {
		var suntimes = suncalc.getTimes(today(), 55.7, 13.1833333);
		var sunrise  = suntimes['sunrise'];

		return new Date(sunrise.getTime() + 1000 * 60 * 60 * 2);
	}

	function getOnOffTimes() {


		var times = [
			{state:'ON',  time:turnOnTime()},
			{state:'OFF', time:turnOffTime()}
		];

		console.log(sprintf('Turning on dining-room lights at %02d:%02d and off at %02d:%02d...', times[0].time.getHours(), times[0].time.getMinutes(), times[1].time.getHours(), times[1].time.getMinutes()));

		return times;
	}

	function run() {

		console.log('Dining room active.');

		tellstick.socket.once('connect', function() {

			function setupTimer() {
				_switch.setTimer(getOnOffTimes());
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
