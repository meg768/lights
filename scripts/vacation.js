var Schedule   = require('node-schedule');
var sprintf    = require('yow').sprintf;
var isDate     = require('yow').isDate;
var isString   = require('yow').isString;
var suncalc    = require('suncalc');

var tellstick  = require('./tellstick.js');

var Module = module.exports = function() {


	function randomSchedule() {

		var time = new Date();
		var schedule = [];

		time.setHours(0);
		time.setMinutes(0);
		time.setSeconds(0);
		time.setMilliseconds(0);

		for (;;) {
			var entry = [];
			var duration = 12;
			var startTime = new Date(time.getTime());
			var endTime = new Date(startTime.getTime() + duration * 60 * 1000);

			entry.time = sprintf('%02d:%02d', time.getHours(), time.getMinutes());
			entry.time = sprintf('%02d:%02d', time.getHours(), time.getMinutes());
			schedule.push(entry);

		}
	}

	function runCellarLights() {
		var _frontCellarLights = tellstick.getDevice('FK-02-02');
		var _backCellarLights = tellstick.getDevice('FK-02-03');

		function getSchedule() {

			var schedule = [];

			schedule.push({time: '18:42', state:'OFF'});
			schedule.push({time: '18:43', state:'ON'});
			schedule.push({time: '18:44', state:'OFF'});
			schedule.push({time: '18:45', state:'ON'});


			return schedule;

		}


		function setupTimer() {
			_frontCellarLights.setTimer(getSchedule());
			_backCellarLights.setTimer(getSchedule());
		}


		var rule    = new Schedule.RecurrenceRule();
		rule.hour   = 0;
		rule.minute = 0;

		Schedule.scheduleJob(rule, function() {
			setupTimer();
		});

		setupTimer();

	}

	runCellarLights();

}
