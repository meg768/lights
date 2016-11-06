var Schedule    = require('node-schedule');
var sprintf     = require('yow').sprintf;
var suncalc     = require('suncalc');
var random      = require('yow').random;
var tellstick   = require('./tellstick.js');

var Module = module.exports = function() {

	var _switch = tellstick.getDevice('VS-04');

	function today() {

		return new Date();
	}

	function turnOnTime() {
		var suntimes = suncalc.getTimes(today(), 55.7, 13.1833333);
		var sunset   = suntimes['sunset'];

		return new Date(sunset.getTime() - 1000 * 60 * 60 * 1);
	}

	function turnOffTime() {

		return random(['01:03', '00:35', '00:43', '01:17']);

		var suntimes = suncalc.getTimes(today(), 55.7, 13.1833333);
		var sunrise  = suntimes['sunrise'];

		return new Date(sunrise.getTime() + 1000 * 60 * 60 * 2);
	}

	function getOnOffTimes() {


		var times = [
			{state:'ON',  time:turnOnTime()},
			{state:'OFF', time:turnOffTime()}
		];

		console.log('Turning on living-room lights at', times[0].time, '...');
		console.log('Turning off living-room lights at', times[1].time, '...');


		return times;
	}

	function run() {

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


	}

	run();
}
