var sprintf    = require('yow/sprintf');
var extend     = require('yow/extend');
var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;

var Matrix = module.exports = function(url, animators) {

	var _this = this;

	var _animations = [];
	var _index = 0;
	var _running = false;
	var _busy = false;

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

	function getNextAnimation() {
		var index = (_index + 1) % _animations.length;
		var animation = _animations[_index];

		return animation;
	}


	function runNextAnimation(priority) {

		if (_running && _animations.length > 0 && !_busy) {
			var animation = _animations[_index % _animations.length];

			_busy = true;
			_index = (_index + 1) % _animations.length;

			animation.run(priority).then(function() {
				_busy = false;
			})

			.catch(function(error) {
				_busy = false;

				console.log('Animation failed.');
				console.log(error.stack);
				console.log('Restarting...');
				
				setTimeout(runNextAnimation, 5000);
			});
		}
	}

	function run() {
		console.log(sprintf('Matrix display %s active.', url));

		// Create animators
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
			runNextAnimation();
		});

	};

	run();
}
