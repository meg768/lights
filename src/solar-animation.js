var sprintf       = require('yow/sprintf');
var random        = require('yow/random');
var isArray       = require('yow/is').isArray;
var isString      = require('yow/is').isString;
var Colors        = require('color-convert');
var SkyBrightness = require('sky-brightness');


var SolarAnimation = module.exports = function(matrix) {

	this.run = function(priority) {

		return new Promise(function(resolve, reject) {

			if (!priority)
				priority = 'normal';

			var sky = new SkyBrightness({
				latitude: 55.70,
				longitude: 13.21
			});

			matrix.emit('emoji', {id:616, priority:priority});

			sky.getSolarBrightness().then(function(brightness) {

				var now   = new Date();
				var hue   = ((now.getHours() % 12) * 60 + now.getMinutes()) / 2;
				var color = Colors.hsl.rgb([hue, 100, 50]);

				var options = {};
				options.textColor   = sprintf('rgb(%d, %d, %d)', color[0], color[1], color[2]);
				options.text        = sprintf('%02d:%02d', Math.floor(brightness), (brightness % 1) * 100);
				options.fontSize    = 22;
				options.priority    = priority;
				options.iterations  = 1;

				matrix.emit('text', options);
			})
			.then(function() {
				resolve();
			})
			.catch(function(error) {
				reject(error);
			})

		});
	};


};
