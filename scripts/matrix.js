var sprintf    = require('yow').sprintf;
var extend     = require('yow').extend;
var isArray    = require('yow').isArray;
var isString   = require('yow').isString;

var Animator   = require('./animator.js');

var Matrix = module.exports = function(url) {

	var _animator = undefined;

	this.socket = require('socket.io-client')(url);
	this.connected = false;

	this.emit = function() {
		return this.socket.emit.apply(this, arguments);
	};

	this.runAnimations = function(animation) {
		_animator = new Animator(animations);
	};

	function run() {
		console.log(sprintf('Matrix display %s active.', url));

		this.socket.on('connect', function() {
			this.connected = true;
			console.log('Connected to display', url);
		});

		this.socket.on('disconnect', function() {
			this.connected = false;
			console.log('Disconnected from display', url);
		});

		this.socket.on('idle', function() {
			if (_animator != undefined) {
				console.log(sprintf('Running next animation for %s.', url));
				_animator.runNextAnimation();
			};
		});

	};

	run();
}
