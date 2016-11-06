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
	cmd.option('-h --host <host>', 'specifies host (localhost)', 'localhost');
	cmd.option('-p --port <port>', 'specifies port (3000)', 3000);
	cmd.option('-t --terrace', 'Control terrace lights');
	cmd.option('-c --cellar', 'Control cellar lights');
	cmd.option('-o --office', 'Control office lights');
	cmd.option('-d --diningroom', 'Control dining room lights');
	cmd.option('-d --livingroom', 'Control living room lights');
	cmd.option('-n --display', 'Run animations on 32x32 LED Matrix');
	cmd.option('-v --vacation', 'Control lights during vacation');
	cmd.option('-a --all', 'Control lights everywhere');
	cmd.option('-w --wait <wait>', 'wait a bit before starting to listen to port (30000)', 30000);

	cmd.parse(process.argv);

	if (cmd.log) {
		var date = new Date();
		var path = sprintf('%s/logs', __dirname);
		var name = sprintf('%04d-%02d-%02d-%02d-%02d-%02d.log', date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());

		mkpath(path);
		redirectLogs(Path.join(path, name));
	}


	function run() {

		if (cmd.terrace || cmd.all) {
			require('./scripts/terrace.js');
		}

		if (cmd.cellar || cmd.all) {
			require('./scripts/cellar.js');
		}

		if (cmd.diningroom || cmd.all) {
			require('./scripts/dining-room.js');
		}

		if (cmd.livingroom || cmd.all) {
			require('./scripts/living-room.js');
		}

		if (cmd.office || cmd.all) {
			require('./scripts/office.js');
		}

		if (cmd.display  || cmd.all) {
			require('./scripts/display32x32.js');
			require('./scripts/display64x32.js');
		}


	}

	setTimeout(run, cmd.wait);
};

new App();
