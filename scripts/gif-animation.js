var sprintf    = require('yow').sprintf;
var random     = require('yow').random;
var isArray    = require('yow').isArray;
var isString   = require('yow').isString;

var tellstick  = require('./tellstick.js');


var GifAnimation = module.exports = function(matrix) {

	var _index = 0;

	function runPerlin(priority) {
		matrix.emit('perlin', {mode:1, priority:priority, duration:60});
	};

	function runRain(priority) {
		matrix.emit('rain', {priority:priority, duration:180});
	};

	function runGif(priority) {
		matrix.emit('animation', {priority:priority, duration:60, name:random(['tree','pacman','pong','boat','fireplace','reduction', 'bubbles', 'crystal', 'dancer', 'haze', 'orbit', 'robot-factory'])});
	}

	this.run = function(priority) {

		return new Promise(function(resolve, reject) {
			var animations = [runRain, runPerlin, runRain, runGif, runRain, runGif, runRain, runGif];
			var animation  = animations[_index++ % animations.length];

			animation(priority);

			resolve();
		});

	}
};
