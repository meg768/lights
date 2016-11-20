var sprintf    = require('yow/sprintf');
var extend     = require('yow/extend');
var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;

var Animator   = require('./animator.js');

var Matrix = module.exports = function(url, animators) {

	var _animator = undefined;
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


	function run() {
		console.log(sprintf('Matrix display %s active.', url));

		var animations = animators.map(function(animator) {
			return new animator(_this);
		});

		_animator = new Animator(animations);
		_running = true;

		_this.socket.on('connect', function() {
			console.log('Connected to display', url);

			_this.connected = true;

			// Make a kick-start
			_animator.runNextAnimation('low');
		});

		_this.socket.on('disconnect', function() {
			console.log('Disconnected from display', url);
			_this.connected = false;
		});

		_this.socket.on('idle', function() {
			if (_running) {
				_animator.runNextAnimation('low');
			};
		});

	};

	run();
}
