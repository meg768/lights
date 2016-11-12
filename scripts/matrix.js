var sprintf    = require('yow').sprintf;
var extend     = require('yow').extend;
var isArray    = require('yow').isArray;
var isString   = require('yow').isString;

var Animator   = require('./animator.js');

var Matrix = module.exports = function(url) {

	var _animator = undefined;
	var _this = this;

	_this.socket = require('socket.io-client')(url);
	_this.connected = false;

	_this.emit = function(name, options) {
		return _this.socket.emit(name, options);
	};

	_this.runAnimations = function(animations) {
		_animator = new Animator(animations);
	};

	function run() {
		console.log(sprintf('Matrix display %s active.', url));

		_this.socket.on('connect', function() {
			console.log('Connected to display', url);

			_this.connected = true;

			// Make a kick-start
			if (_animator != undefined)
				_animator.runNextAnimation('low');
		});

		_this.socket.on('disconnect', function() {
			console.log('Disconnected from display', url);
			_this.connected = false;
		});

		_this.socket.on('idle', function() {
			if (_animator != undefined) {
				console.log(sprintf('Running next animation for %s.', url));
				_animator.runNextAnimation();
			};
		});

	};

	run();
}
