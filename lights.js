#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var Path = require('path');
var mkpath = require('yow').mkpath;
var sprintf = require('yow').sprintf;
var isObject = require('yow').isObject;
var prefixLogs = require('yow').prefixLogs;

var ClockAnimation  = require('./scripts/clock-animation.js');
var QuotesAnimation = require('./scripts/quotes-animation.js');
var NewsAnimation   = require('./scripts/news-animation.js');
var GifAnimation    = require('./scripts/gif-animation.js');
var Matrix          = require('./scripts/matrix.js');

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
			require('./scripts/socket-server.js')(argv);
		}

		if (argv.all || argv.terrace) {
			require('./scripts/terrace.js');
		}

		if (argv.all || argv.cellar) {
			require('./scripts/cellar.js');
		}

		if (argv.all || argv.diningRoom) {
			require('./scripts/dining-room.js');
		}

		if (argv.all || argv.livingRoom) {
			require('./scripts/living-room.js');
		}

		if (argv.all || argv.office) {
			require('./scripts/office.js');
		}

		if (argv.all || argv.matrix) {
			var matrix = new Matrix('http://85.24.190.138:3003/hzeller-matrix');

			var animations = [];

			animations.push(new ClockAnimation(matrix));
			animations.push(new GifAnimation(matrix));

			animations.push(new ClockAnimation(matrix));
			animations.push(new NewsAnimation(matrix));

			animations.push(new ClockAnimation(matrix));
			animations.push(new GifAnimation(matrix));

			animations.push(new ClockAnimation(matrix));
			animations.push(new QuotesAnimation(matrix));

			matrix.runAnimations(animations);
		}

		if (argv.all || argv.matrix) {
			var matrix = new Matrix('http://85.24.190.138:3004/hzeller-matrix');

			var animations = [];

			animations.push(new ClockAnimation(matrix));
			animations.push(new NewsAnimation(matrix));
			animations.push(new ClockAnimation(matrix));
			animations.push(new QuotesAnimation(matrix));

			matrix.runAnimations(animations);
		}

	}


	setTimeout(run, 0);
};

new App();
