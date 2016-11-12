var Schedule   = require('node-schedule');

var sprintf    = require('yow').sprintf;
var random     = require('yow').random;
var isArray    = require('yow').isArray;
var isString   = require('yow').isString;

var ClockAnimation  = require('./clock-animation.js');
var QuotesAnimation = require('./quotes-animation.js');
var NewsAnimation   = require('./news-animation.js');
var GifAnimation    = require('./gif-animation.js');
var Animator        = require('./animator.js');

var Display = function(url) {

	var _matrix = require('socket.io-client')(url);

	function run() {
		console.log('Display active:', url);

		var animations = [];

		animations.push(new ClockAnimation(_matrix));
		animations.push(new NewsAnimation(_matrix));
		animations.push(new ClockAnimation(_matrix));
		animations.push(new QuotesAnimation(_matrix));

		var animator = new Animator(animations);

		_matrix.on('connect', function() {
			console.log('Connected to display', url);
		});

		_matrix.on('disconnect', function() {
			console.log('Disconnected from display', url);
		});

		_matrix.on('idle', function() {
			if (_matrix.connected) {
				console.log(sprintf('Running next animation for %s.', url));
				animator.runNextAnimation();

			}
			else {
				console.log(sprintf('Ignoring animation for %s since it is disconnected.', url));
			}
		});


	};

	run();
}

module.exports = new Display('http://85.24.190.138:3004/hzeller-matrix');
