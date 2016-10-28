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
	cmd.option('-v --vacation', 'Control lights during vacation');

	cmd.parse(process.argv);

	tellstick.connect(cmd.host, cmd.port);

	if (cmd.log) {
		var date = new Date();
		var path = sprintf('%s/logs', __dirname);
		var name = sprintf('%04d-%02d-%02d-%02d-%02d-%02d.log', date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());

		mkpath(path);
		redirectLogs(Path.join(path, name));
	}

	if (cmd.terrace) {
		console.log('Activating terrace...');
		var Module = require('./scripts/terrace.js');
		new Module();
	}

	if (cmd.cellar) {
		console.log('Activating cellar...');
		var Module = require('./scripts/cellar.js');
		new Module();
	}

	if (cmd.diningroom) {
		console.log('Activating dining room...');
		var Module = require('./scripts/dining-room.js');
		new Module();
	}

	if (cmd.vacation) {
		console.log('Activating vacation lightning...');
		var Module = require('./scripts/vacation.js');
		new Module();
	}

	if (cmd.office) {
		console.log('Activating office lightning...');
		var Module = require('./scripts/office.js');
		new Module();
	}

};

new App();
