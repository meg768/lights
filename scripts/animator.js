var Schedule   = require('node-schedule');

var sprintf    = require('yow').sprintf;
var random     = require('yow').random;
var isArray    = require('yow').isArray;
var isString   = require('yow').isString;



var Module = module.exports = function(animations) {

	var _animations      = animations;
	var _index           = 0;

	this.setAnimations = function(animations) {
		_animations = animations;
		_index = 0;
	};

	this.runNextAnimation = function(priority) {

		function runAnimation(animation, priority) {
			animation.run(priority).then(function() {
			})
			.catch(function() {
			});
		};


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

	this.runNextAnimation();
}
