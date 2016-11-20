var sprintf    = require('yow/sprintf');
var extend     = require('yow/extend');
var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;

var Matrix = module.exports = function(url, animators) {

	var _animations = [];
	var _index = -1;
	var _this = this;
	var _running = false;

	_this.socket = require('socket.io-client')(url);
	_this.connected = false;

	_this.emit = function(name, options) {
		return _this.socket.emit(name, options);
	};

	_this.startAnimations = function() {
		_running = true;
		_this.socket.emit('emoji', {id:435, pause:1, priority:'low'});
	};

	_this.stopAnimations = function() {
		_running = false;
		_this.socket.emit('emoji', {id:435, pause:1, priority:'!'});
	};

	function runNextAnimation(priority) {

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

	function run() {
		console.log(sprintf('Matrix display %s active.', url));

		animators.forEach(function(animator) {
			_animations.push(new animator(_this));
		});

		_running = true;

		_this.socket.on('connect', function() {
			console.log('Connected to display', url);

			_this.connected = true;

			// Make a kick-start
			runNextAnimation('low');
		});

		_this.socket.on('disconnect', function() {
			console.log('Disconnected from display', url);
			_this.connected = false;
		});

		_this.socket.on('idle', function() {
			if (_running) {
				runNextAnimation('low');
			};
		});

	};

	run();
}
