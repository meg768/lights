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



function debug() {
	console.log.apply(this, arguments);
}

var App = function(argv) {


	var argv = parseArgs();

	function parseArgs() {

		var args = require('yargs');

		args.usage('Usage: $0 [options]');
		args.option('h', {alias:'help',        describe:'Displays this information'});
		args.option('d', {alias:'dining-room', describe:'Control dining room lights', default:false});
		args.option('l', {alias:'living-room', describe:'Control living room lights', default:false});
		args.option('o', {alias:'office',      describe:'Control office lights', default:false});
		args.option('c', {alias:'cellar',      describe:'Control cellar lights', default:false});
		args.option('t', {alias:'terrace',     describe:'Control terrace lights', default:false});
		args.option('a', {alias:'all',         describe:'Control all lights', default:false});
		args.wrap(null);

		return args.argv;
	}


	function run() {

		prefixLogs();

		console.log(argv);

		if (argv.terrace) {
			require('./scripts/terrace.js');
		}

		if (argv.cellar) {
			require('./scripts/cellar.js');
		}

		if (argv.diningRoom) {
			require('./scripts/dining-room.js');
		}

		if (argv.livingRoom) {
			require('./scripts/living-room.js');
		}

		if (argv.office) {
			require('./scripts/office.js');
		}

		if (argv.display) {
			require('./scripts/display-32x32.js');
			require('./scripts/display-64x32.js');
		}
	}


	setTimeout(run, 0);
};

new App();
