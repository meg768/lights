var sprintf    = require('yow/sprintf');
var random     = require('yow/random');
var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;
var Colors     = require('color-convert');


var QuotesAnimation = module.exports = function(matrix) {

	this.run = function(priority) {

		return new Promise(function(resolve, reject) {

			if (!priority)
				priority = 'normal';

			var now   = new Date();
			var hue   = ((now.getHours() % 12) * 60 + now.getMinutes()) / 2;
			var color = Colors.hsl.rgb([hue, 100, 50]);

			var options = {};
			options.textColor   = sprintf('rgb(%d, %d, %d)', color[0], color[1], color[2]);
			options.text        = sprintf('%02d:%02d', now.getHours(), now.getMinutes());
			options.fontSize    = 22;
			options.speed       = 0.70;
			options.priority    = priority;
			options.iterations  = 2;

			matrix.emit('text', options);

			resolve();
		});
	};


};
