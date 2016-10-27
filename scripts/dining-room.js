var Schedule    = require('node-schedule');
var sprintf     = require('yow').sprintf;
var suncalc     = require('suncalc');
var tellstick   = require('./tellstick.js');

var Module = module.exports = function() {

	var _switch = tellstick.getDevice('VS-03');

	function today() {

		return new Date();

		// Winter
		return new Date(2001,12,31,1,1,1);

		// Summer
		return new Date(2001,6,22,1,1,1);

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

		console.log('Turning on dining-room lights at', times[0].time, '...');
		console.log('Turning off dining-room lights at', times[1].time, '...');


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
