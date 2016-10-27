#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var Path = require('path');
var mkpath = require('yow').mkpath;
var sprintf = require('yow').sprintf;
var isObject = require('yow').isObject;
var isString = require('yow').isString;
var isDate = require('yow').isDate;
var socket = require('socket.io-client')('http://app-o.se:3000');
var Schedule = require('node-schedule');
var EventEmitter = require('events');


function debug() {
	console.log.apply(this, arguments);
}


var Device = function(name) {

	var _this = this;
	var _triggers  = [];

	_this.name = name;
	_this.state = 'OFF';
	_this.eventsDisabled = false;

	_this.turnOn = function() {
		_this.setState('ON');
	}

	_this.turnOff = function() {
		_this.setState('OFF');
	}

	_this.setState = function(state) {

		if (state == undefined)
			state = 'ON';

		if (state != 'ON' && state != 'OFF')
			debug(sprintf('Unknown state \'%s\'!', state));

		debug(sprintf('Setting device %s to state %s.', _this.name, state));

		// Turn off events
		_this.eventsDisabled = true;

		if (state == 'ON')
			socket.emit('turnOn', {name:_this.name});
		else if (state == 'OFF')
			socket.emit('turnOff', {name:_this.name});

		// Activate again after a few seconds
		setTimeout(function() {
			_this.eventsDisabled = false;
		}, 3000);


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

	var _devices = {};

	socket.on('tellstick', function(params) {

		console.log(params);
		var device = _devices[params.name];

		if (device != undefined) {

			device.emit(params.status);
		}
	})

	socket.on('hello', function(params) {
		console.log('hello!');
	})


	this.getDevice = function(name) {
		var device = _devices[name];

		if (_devices[name] == undefined)
			_devices[name] = new Device(name);


		return _devices[name];
	}
}

module.exports = new Tellstick();
