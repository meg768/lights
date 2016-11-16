var Schedule   = require('node-schedule');

var sprintf    = require('yow').sprintf;
var random     = require('yow').random;
var isArray    = require('yow').isArray;
var isString   = require('yow').isString;



var Module = module.exports = function(animations) {

	var _animations      = animations;
	var _index           = -1;
	var _this            = this;

	this.runNextAnimation = function(priority) {

		function runLater() {
			setTimeout(function() {
				_this.runNextAnimation(priority);
			}, 60000);
		}

		function runAnimation(animation, priority) {
			animation.run(priority).then(function() {
			})
			.catch(function(error) {
				console.log('Animation failed.', error);

				runLater();
			});
		};

		var now  = new Date();
		var time = sprintf('%02d:%02d', now.getHours(), now.getMinutes());

		if (_animations.length > 0 && time >= '08:00' && time <= '23:59') {
			_index = (_index + 1) % _animations.length;
			runAnimation(_animations[_index], priority);
		}
		else {
			runLater();
		}
	}

	this.runNextAnimation();
}
