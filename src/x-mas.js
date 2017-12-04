var Schedule    = require('node-schedule');
var sprintf     = require('yow/sprintf');
var tellstick   = require('./tellstick.js');

var Module = function() {

	var _switch = tellstick.getDevice('XMAS-01');

	function getOnOffTimes() {


		var times = [
			{state:'ON',   time:'06:00'},
			{state:'OFF',  time:'10:00'},
			{state:'ON',   time:'15:00'},
			{state:'OFF',  time:'02:00'}
		];

		return times;
	}

	function run() {

		console.log('X-mas lights active.');

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
