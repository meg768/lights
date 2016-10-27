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

	var Terrace = require('./scripts/terrace.js');
	var DiningRoom = require('./scripts/dining-room.js');
	var Cellar = require('./scripts/cellar.js');

	cmd.version('1.0.0');
	cmd.option('-l --log', 'redirect logs to file');
	cmd.option('-h --host <host>', 'connect to specified server', 'localhost');
	cmd.option('-p --port <port>', 'connect to specified port', 3001);
	cmd.parse(process.argv);


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
