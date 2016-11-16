var sprintf    = require('yow').sprintf;
var random     = require('yow').random;
var isArray    = require('yow').isArray;
var isString   = require('yow').isString;

var tellstick  = require('./tellstick.js');


var GifAnimation = module.exports = function(matrix) {

	var _index = random(3, 1013);
	var _animations = [runRain, runPerlin, runRain, runGif, runRain, runGif, runRain, runGif];

	function runPerlin(priority) {
		matrix.emit('perlin', {mode:3, priority:priority, duration:30});
	};

	function runRain(priority) {
		matrix.emit('rain', {priority:priority, duration:30});
	};

	function runGif(priority) {
		matrix.emit('animation', {priority:priority, duration:30, name:random(['tree','pacman','pong','boat','fireplace','reduction', 'bubbles', 'crystal', 'dancer', 'haze', 'orbit', 'robot-factory'])});
	}

	function runAnimation(animation, priority) {
		animation(priority);
	}

	this.run = function(priority) {

		return new Promise(function(resolve, reject) {
			console.log('Running GIF-animation...');

			// Move on to next
			_index = (_index + 1)  % _animations.length;

			// Run it
			runAnimation(_animations[_index]);

			// Finish
			resolve();
		});

	}
};
