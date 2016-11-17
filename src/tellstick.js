#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var Path = require('path');
var mkpath = require('yow/fs').mkpath;
var sprintf = require('yow/sprintf');
var isObject = require('yow/is').isObject;
var isString = require('yow/is').isString;
var isInteger = require('yow/is').isInteger;
var isDate = require('yow/is').isDate;
var Schedule = require('node-schedule');
var EventEmitter = require('events');

function debug() {
	console.log.apply(this, arguments);
}


var Device = function(socket, name) {

	var _this = this;
	var _triggers  = [];
	var _timer = undefined;

	_this.name = name;
	_this.state = 'OFF';
	_this.eventsDisabled = false;


	_this.turnOn = function(pause) {
		_this.setState('ON', pause);
	}

	_this.turnOff = function(pause) {
		_this.setState('OFF', pause);
	}

	_this.pauseEvents = function(delay) {

		if (delay == undefined)
			delay = 3000;

		if (_timer != undefined)
			clearTimeout(_timer);

		// Turn off events
		_this.eventsDisabled = true;

		_timer = setTimeout(function() {
			_this.eventsDisabled = false;
			_timer = undefined;
		}, delay);
	}

	_this.setState = function(state, pause) {

		if (state == undefined)
			state = 'ON';

		if (state != 'ON' && state != 'OFF')
			debug(sprintf('Unknown state \'%s\'!', state));

		debug(sprintf('Setting device %s to state %s.', _this.name, state));

		// Turn off events for a while
		_this.pauseEvents(pause);

		if (state == 'ON')
			socket.emit('turnOn', _this.name);
		else if (state == 'OFF')
			socket.emit('turnOff', _this.name);
	};

	_this.setTimer = function(schedule) {

		function setCurrentState() {

			// This really only works for daily timers

			var now = new Date();
			var invocations = [];

			_triggers.forEach(function(trigger) {
				var date  = trigger.job.nextInvocation();
				var state = trigger.state;

				invocations.push({date:date, state:state});
			});

			invocations.sort(function(a, b) {
				return a.date.valueOf() - b.date.valueOf();
			});

			var currentState = undefined;

			invocations.forEach(function(item) {
				if (item.date.valueOf() >= now.valueOf())
					currentState = item.state;
			});

			_this.setState(currentState);
		}


		function scheduleJobs() {

			// Clear all previous jobs
			_triggers.forEach(function(trigger) {
				trigger.job.cancel();
			});

			_triggers = [];

			schedule.forEach(function(item) {

				var rule = undefined;

				if (rule == undefined) {
					if (isObject(item.time)) {

						if (item.time.hour != undefined || item.time.minute != undefined) {
							rule = new Schedule.RecurrenceRule();

							if (item.time.hour != undefined)
								rule.hour = item.time.hour;

							if (item.time.minute != undefined)
								rule.minute = item.time.minute;
						}
					}
				}

				if (rule == undefined) {
					if (isString(item.time)) {
						if (item.time.split(' ').length == 5) {
							rule = item.time;
						}
					}
				}

				if (rule == undefined) {
					if (isString(item.time)) {
						var match = item.time.match('^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$');

						if (match) {
							rule = new Schedule.RecurrenceRule();
							rule.hour = parseInt(match[1]);
							rule.minute = parseInt(match[2]);
						}

					}
				}

				if (rule == undefined) {
					if (isDate(item.time)) {
						rule = new Schedule.RecurrenceRule();
						rule.hour = item.time.getHours();
						rule.minute = item.time.getMinutes();
					}

				}

				if (rule != undefined) {
					var time = '????';

					if (isInteger(rule.hour) && isInteger(rule.minute)) {
						time = sprintf('%02d:%02d', rule.hour, rule.minute);
					}

					console.log('Scheduling device %s to turn %s at %s.', _this.name, item.state, time);

					var job = Schedule.scheduleJob(rule, function() {
						_this.setState(item.state);
					});

					_triggers.push({job:job, state:item.state});

				}

			});

		}

		scheduleJobs();
		setCurrentState();

	}
};

util.inherits(Device, EventEmitter);


var Tellstick = function() {

	this.socket = require('socket.io-client')('http://85.24.190.138:3002/tellstick');

	var _devices = {};
	var _socket = this.socket;

	_socket.on('status', function(params) {

		var device = _devices[params.name];

		if (device != undefined) {
			if (!device.eventsDisabled) {
				device.state = params.state;
				device.emit(params.state);
			}
		}
		else {
			console.log('Device', params.name, 'undefined, no action.');
		}
	});

	this.getDevice = function(name) {
		var device = _devices[name];

		if (_devices[name] == undefined) {
			_devices[name] = new Device(_socket, name);

		};

		return _devices[name];
	}
}

module.exports = new Tellstick();
