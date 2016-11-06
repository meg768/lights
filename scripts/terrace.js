var Schedule   = require('node-schedule');
var sprintf    = require('yow').sprintf;
var isDate     = require('yow').isDate;
var isString   = require('yow').isString;
var suncalc    = require('suncalc');

var tellstick  = require('./tellstick.js');

var Module = function() {

	var _terraceLights = tellstick.getDevice('VS-01');

	function getOnOffTimes(date) {

		if (isDate(date))
			date = new Date(date);

		if (date == undefined)
			date = new Date();

		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);

		var suntimes = suncalc.getTimes(new Date(date.valueOf() + 12 * 60 * 60 * 1000), 55.7, 13.1833333);
		var morningOffset = suntimes.sunrise - suntimes.dawn;
		var eveningOffset = suntimes.sunset - suntimes.dusk;

		var morningOn  = suntimes.dawn;
		var morningOff = new Date(suntimes.sunrise.valueOf() + morningOffset);
		var eveningOn  = new Date(suntimes.sunset.valueOf() + eveningOffset);
		var eveningOff = suntimes.dusk;

		var startOfDay  = new Date(date.valueOf() + 7 * 60 * 60 * 1000);
		var endOfDay    = new Date(startOfDay.valueOf() + 18 * 60 * 60 * 1000);

		// Light up in the morning (even if it isn't dawn yet)
		morningOn = new Date(Math.min(startOfDay.valueOf(), morningOn.valueOf()));

		// Keep lights on until at least end of day
		eveningOff = new Date(Math.max(endOfDay, eveningOff));

		console.log('Turning on terrace lights at', morningOn, '...');
		console.log('Turning off terrace lights at', morningOff, '...');
		console.log('Turning on terrace lights at', eveningOn, '...');
		console.log('Turning off terrace lights at', eveningOff, '...');

		var onoff = [
			{time:morningOn,   state:'ON'},
			{time:morningOff,  state:'OFF'},
			{time:eveningOn,   state:'ON'},
			{time:eveningOff,  state:'OFF'}
		];

		return onoff;

	}


	function run() {

		console.log('Terrace lights active.');

		tellstick.socket.on('connect', function() {
			function setupTimer() {
				_terraceLights.setTimer(getOnOffTimes());
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
