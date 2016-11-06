var Schedule   = require('node-schedule');

var sprintf    = require('yow').sprintf;
var random     = require('yow').random;
var isArray    = require('yow').isArray;
var isString   = require('yow').isString;

var tellstick  = require('./tellstick.js');

var ClockAnimation  = require('./clock-animation.js');
var QuotesAnimation = require('./quotes-animation.js');
var NewsAnimation   = require('./news-animation.js');
var GifAnimation    = require('./gif-animation.js');

var Module = module.exports = function(name) {

	var _animations      = [];
	var _index           = 0;
	var _matrix          = undefined;

	var _textSwitch      = tellstick.getDevice('FK-00-01');
	var _emojiSwitch     = tellstick.getDevice('FK-00-03');
	var _motionSensor    = tellstick.getDevice('RV-02');

	function run() {
		console.log('Running display', name, '...');

		if (name == '32x32') {
			_matrix = require('socket.io-client')('http://85.24.190.138:3003/hzeller-matrix');
		}

		if (name == '64x32') {
			_matrix = require('socket.io-client')('http://85.24.190.138:3004/hzeller-matrix');
		}

		_matrix.on('idle', function() {
			runNextAnimation();
		});

		_animations = getCurrentAnimations();
		_index = 0;

		runNextAnimation();
	};

	function getCurrentAnimations() {

		var animations = [];

		if (name == '32x32') {
			animations.push(new ClockAnimation(_matrix));
			animations.push(new GifAnimation(_matrix));
			animations.push(new ClockAnimation(_matrix));
			animations.push(new NewsAnimation(_matrix));
			animations.push(new ClockAnimation(_matrix));
			animations.push(new QuotesAnimation(_matrix));
		}

		if (name == '64x32') {
			animations.push(new ClockAnimation(_matrix));
			animations.push(new NewsAnimation(_matrix));
			animations.push(new ClockAnimation(_matrix));
			animations.push(new QuotesAnimation(_matrix));
		}

		return animations;
	}


	function runAnimation(animation, priority) {
		animation.run(priority).then(function() {
		})
		.catch(function() {
		});
	};

	function runNextAnimation(priority) {
		var now  = new Date();
		var time = sprintf('%02d:%02d', now.getHours(), now.getMinutes());

		if (_animations.length > 0 && time >= '08:00' && time <= '23:59') {
			runAnimation(_animations[_index++ % _animations.length], priority);
		}
		else {
			// If nothing to do, call again in 60 seconds...
			setTimeout(function() {
				runNextAnimation(priority);
			}, 60000);
		}
	}

	_motionSensor.on('ON', function() {
		_motionSensor.pauseEvents(2000);
		//_matrix.emit('text', {text:'!!!', priority:'high'});

	});


	run();
}
