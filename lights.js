#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var Path = require('path');
var sprintf = require('yow/sprintf');
var mkpath = require('yow/fs').mkpath;
var isObject = require('yow/is').isObject;
var prefixLogs = require('yow/logs').prefix;


function debug() {
	console.log.apply(this, arguments);
}

var App = function(argv) {

	var argv = parseArgs();

	function parseArgs() {

		var args = require('yargs');

		args.usage('Usage: $0 [options]');
		args.help('h').alias('h', 'help');

		args.option('d', {alias:'dining-room', describe:'Control dining room lights', default:false});
		args.option('l', {alias:'living-room', describe:'Control living room lights', default:false});
		args.option('o', {alias:'office',      describe:'Control office lights', default:false});
		args.option('c', {alias:'cellar',      describe:'Control cellar lights', default:false});
		args.option('t', {alias:'terrace',     describe:'Control terrace lights', default:false});
		args.option('a', {alias:'all',         describe:'Control all lights', default:true});
		args.option('L', {alias:'listen',      describe:'Start socket service', default:false});
		args.option('p', {alias:'port',        describe:'Listen to specified port', default:3010});

		args.wrap(null);

		args.check(function(argv) {
			return true;
		});

		return args.argv;
	}



	function run() {

		prefixLogs();

		require('./src/terrace.js');
		require('./src/cellar.js');
		require('./src/dining-room.js');
		require('./src/living-room.js');
		require('./src/office.js');

		require('./src/alerts.js');

	}


	setTimeout(run, 0);
};

module.exports = new App();
