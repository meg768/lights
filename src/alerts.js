var sprintf    = require('yow/sprintf');
var Timer      = require('yow/timer');
var tellstick  = require('./tellstick.js');

var Module = function() {

	var _active = false;
	var _switch = tellstick.getDevice('VS-05');
	var _cellarSensor = tellstick.getDevice('RV-02');
	var _officeSensor = tellstick.getDevice('RV-01');
	var _livingRoomSensor = tellstick.getDevice('RV-03');

	function alert(text) {
		var sid    = 'AC6d347f8c4600eb938fe37b692c19f018';
		var token  = '9c1471d846f5ad2e8650cba838daa6b7';
		var client = require('twilio')(sid, token);

		var now = new Date();
		var msg = sprintf('%04d-%02d-%02d %02d:%02d %s', now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), text);

		var options  = {};
		options.to   = ['+46702262122', '+46706291882', '+46704626863'];
		options.to   = ['+46706291882'];
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
			if (!_active) {
				_active = true;

				console.log('Alerts activated.');
				alert('Larm aktiverat.')
			}
		});

		_switch.on('OFF', function() {
			if (_active) {
				_active = false;

				console.log('Alerts deactivated.');
				alert('Larm avaktiverat.')
			}
		});

		_livingRoomSensor.on('ON', function() {
			if (_active) {
				console.log('Alert in the living room.');
				_livingRoomSensor.pauseEvents(60000);
				alert('Rörelse i stora rummet.');
			}
		});


		_cellarSensor.on('ON', function() {
			if (_active) {
				console.log('Alert in the office.');
				_cellarSensor.pauseEvents(60000);
				alert('Rörelse i källaren.');
			}
		});

		_officeSensor.on('ON', function() {
			var matrix = require('./matrix-64x32.js');

			if (_active) {
				console.log('Alert in the cellar.');
				_officeSensor.pauseEvents(60000);
				alert('Rörelse på kontoret.');

				matrix.emit('text', {text:'Inbrott pågår!', priority:'!', iterations:3});
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
