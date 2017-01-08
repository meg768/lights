var sprintf    = require('yow/sprintf');
var Timer      = require('yow/timer');
var tellstick  = require('./tellstick.js');

var Module = function() {

	var _active = false;
	var _awake  = true;
	var _switch = tellstick.getDevice('VS-05');
	var _cellarSensor = tellstick.getDevice('RV-02');
	var _officeSensor = tellstick.getDevice('RV-01');
	var _livingRoomSensor = tellstick.getDevice('RV-03');
	var _timer = new Timer();

	function runPromises(promises) {

		return new Promise(function(resolve, reject) {
			var tmp = Promise.resolve();

			promises.forEach(function(promise) {
				tmp = tmp.then(function() {
					return promise();
				});
			});

			tmp.then(function() {
				resolve();
			})
			.catch(function(error) {
				reject(error);
			});

		});

	};

	function sendSMS(to, text) {
		return new Promise(function(resolve, reject) {
			var sid    = 'AC6d347f8c4600eb938fe37b692c19f018';
			var token  = '9c1471d846f5ad2e8650cba838daa6b7';
			var client = require('twilio')(sid, token);

			var options  = {};
			options.to   = to;
			options.from = '+46769447443';
			options.body = text;

			client.sendSms(options, function(error, message) {

			    if (error)
					reject(error);
				else
					resolve();
			});

		});
	};


	function alert(text) {
		var alerts = [];

		var now = new Date();
		var msg = sprintf('%04d-%02d-%02d %02d:%02d %s', now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), text);

		console.log('Sending SMS:', text);

		//alerts.push(sendSMS.bind(this, '+46702262122', msg));
		alerts.push(sendSMS.bind(this, '+46706291882', msg));

		runPromises(alerts).then(function() {
			console.log('SMS sent to all recipients.');
		})
		.catch(function(error) {
			console.log(error);
		});

	}


	function movement(sensor) {

		if (_active) {
			console.log('Movement on sensor', sensor.name, '...');

			if (_awake) {
				alert('Rörelse i huset.');
			}

			_awake = false;

			// Wake up after X minutes
			_timer.setTimer(60000 * 1, function() {
				_awake = true;
			});
		}


	}

	function listen() {
		_switch.on('ON', function() {
			if (!_active) {
				_active = true;
				_Xawake  = true;

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
			movement(_livingRoomSensor);
		});

		_cellarSensor.on('ON', function() {
			movement(_cellarSensor);
		});

		_officeSensor.on('ON', function() {
			movement(_officeSensor);
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
