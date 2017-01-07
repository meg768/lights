var sprintf    = require('yow/sprintf');
var Timer      = require('yow/timer');
var tellstick  = require('./tellstick.js');

var Module = function() {

	var _active = false;
	var _switch = tellstick.getDevice('VS-05');
	var _cellarSensor = tellstick.getDevice('RV-02');
	var _officeSensor = tellstick.getDevice('RV-01');

	function alert(text) {
		var sid    = 'AC6d347f8c4600eb938fe37b692c19f018';
		var token  = '9c1471d846f5ad2e8650cba838daa6b7';
		var client = require('twilio')(sid, token);

		var now = new Date();
		var msg = sprintf('%04d-%02d-%02d %02d:%02d %s', now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), text);

		var options  = {};
		options.to   = ['+46702262122', '+46706291882'];
		options.from = '+46769447443';
		options.body = msg;

		client.sendSms(options, function(error, message) {
			console.log('Sending SMS:', msg);

		    if (error)
				console.log(error);
		});
	}


	function listen() {
		_switch.on('ON', function() {
			console.log('Alerts activated.');
			_active = true;
		});

		_switch.on('OFF', function() {
			console.log('Alerts deactivated.');
			_active = false;
		});

		_cellarSensor.on('ON', function() {
			if (_active) {
				console.log('Alert in the office.')
				_cellarSensor.pauseEvents(60000);
				alert('Rörelse i källaren.');
			}
		});

		_officeSensor.on('ON', function() {
			if (_active) {
				console.log('Alert in the cellar.')
				_officeSensor.pauseEvents(60000);
				alert('Rörelse på kontoret.');
			}
		});

	}


	function run() {

		console.log('Alert module loaded.');

		tellstick.socket.once('connect', function() {
			listen();
		});
	}

	run();
}

module.exports = new Module();
