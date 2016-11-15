var Schedule   = require('node-schedule');
var sprintf    = require('yow').sprintf;
var isDate     = require('yow').isDate;
var isString   = require('yow').isString;
var suncalc    = require('suncalc');

var tellstick  = require('./tellstick.js');

var Module = function() {

	var _terraceLights = tellstick.getDevice('VS-01');

	function getSunTime(name) {
		var suntimes = suncalc.getTimes(new Date(), 55.7, 13.1833333);
		return new Date(suntimes[name]);
	}

	function getOnOffTimes() {

		var midnight = new Date();
		midnight.setHours(0);
		midnight.setMinutes(0);
		midnight.setSeconds(0);
		midnight.setMilliseconds(0);

		var sunrise = getSunTime('sunrise');
		var sunset  = getSunTime('sunset');
		var dusk    = getSunTime('dusk');
		var dawn    = getSunTime('dawn');

		var morningOffset = sunrise - dawn;
		var eveningOffset = sunset - dusk;

		var morningOn  = dawn;
		var morningOff = new Date(sunrise.valueOf() + morningOffset);
		var eveningOn  = new Date(sunset.valueOf() + eveningOffset);
		var eveningOff = dusk;

		var startOfDay  = new Date(midnight.valueOf() + 7 * 60 * 60 * 1000);
		var endOfDay    = new Date(startOfDay.valueOf() + 18 * 60 * 60 * 1000);

		// Light up in the morning (even if it isn't dawn yet)
		morningOn = new Date(Math.min(startOfDay.valueOf(), morningOn.valueOf()));

		// Keep lights on until at least end of day
		eveningOff = new Date(Math.max(endOfDay.valueOf(), eveningOff.valueOf()));

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

		tellstick.socket.once('connect', function() {
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
