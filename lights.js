#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var Path = require('path');
var mkpath = require('yow').mkpath;
var sprintf = require('yow').sprintf;
var isObject = require('yow').isObject;
var prefixLogs = require('yow').prefixLogs;


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
		args.option('m', {alias:'matrix',      describe:'Control matrix displays', default:false});

		args.wrap(null);

		args.check(function(argv) {
			return true;
		});

		return args.argv;
	}



	function run() {

		prefixLogs();

		if (argv.listen) {
			require('./src/socket-server.js')(argv);
		}

		if (argv.all || argv.terrace) {
			require('./src/terrace.js');
		}

		if (argv.all || argv.cellar) {
			require('./src/cellar.js');
		}

		if (argv.all || argv.diningRoom) {
			require('./src/dining-room.js');
		}

		if (argv.all || argv.livingRoom) {
			require('./src/living-room.js');
		}

		if (argv.all || argv.office) {
			require('./src/office.js');
		}

		if (argv.all || argv.matrix) {
			require('./src/matrix-32x32.js');
			require('./src/matrix-64x32.js');
		}

	}


	setTimeout(run, 0);
};

module.exports = new App();
