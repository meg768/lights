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

	_this.emit = function() {
		console.log('emitting matrix', arguments);
		return _this.socket.emit.apply(this, arguments);
	};

	_this.runAnimations = function(animations) {
		console.log('sdfgsdfgjkhsgflksdhfg');
		_animator = new Animator(animations);
	};

	function run() {
		console.log(sprintf('Matrix display %s active.', url));

		_this.socket.on('connect', function() {
			_this.connected = true;
			console.log('Connected to display', url);
		});

		_this.socket.on('disconnect', function() {
			_this.connected = false;
			console.log('Disconnected from display', url);
		});

		_this.socket.on('idle', function() {
			console.log('Idle...');
			if (_animator != undefined) {
				console.log(sprintf('Running next animation for %s.', url));
				_animator.runNextAnimation();
			};
		});

	};

	run();
}
