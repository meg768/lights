#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var Path = require('path');
var mkpath = require('yow').mkpath;
var sprintf = require('yow').sprintf;
var isObject = require('yow').isObject;
var redirectLogs = require('yow').redirectLogs;
var prefixLogs = require('yow').prefixLogs;
var cmd = require('commander');

var tellstick = require('./scripts/tellstick.js');

function debug() {
	console.log.apply(this, arguments);
}


var App = function() {

	prefixLogs();

	cmd.version('1.0.0');
	cmd.option('-l --log', 'redirect logs to file');
	cmd.parse(process.argv);

	if (cmd.log) {
		var date = new Date();
		var path = sprintf('%s/logs', __dirname);
		var name = sprintf('%04d-%02d-%02d-%02d-%02d-%02d.log', date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());

		mkpath(path);
		redirectLogs(Path.join(path, name));
	}

	var Terrace = require('./scripts/terrace.js');
	var DiningRoom = require('./scripts/dining-room.js');
	var Cellar = require('./scripts/cellar.js');

	new Terrace();
	new DiningRoom();
	new Cellar();

/*
	var motionSensor = tellstick.getDevice('RV-01');
	var buttonA = tellstick.getDevice('FK-01-01');
	var buttonB = tellstick.getDevice('FK-01-02');
	var buttonC = tellstick.getDevice('FK-01-03');

	motionSensor.on('ON', function() {
		console.log('MOvement!');
		buttonA.setState('ON');
	});
*/

};

new App();
