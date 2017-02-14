var sprintf    = require('yow/sprintf');
var Timer      = require('yow/timer');
var tellstick  = require('./tellstick.js');

var Module = function() {

	var _active = true;
	var _awake  = true;
	var _switch = tellstick.getDevice('VS-05');
	var _cellarSensor = tellstick.getDevice('RV-02');
	var _officeSensor = tellstick.getDevice('RV-01');
	var _livingRoomSensor = tellstick.getDevice('RV-03');
	var _doorbell = tellstick.getDevice('RK-01');

	var _timer = new Timer();

	var _warningTimer = new Timer();
	var _warningLamp = tellstick.getDevice('PS-02');

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
			var config = require('./config.js');
			var client = require('twilio')(config.twilio.sid, config.twilio.token);

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

		alerts.push(sendSMS.bind(this, '+46702262122', msg));
		alerts.push(sendSMS.bind(this, '+46706291882', msg));

		runPromises(alerts).then(function() {
			console.log('SMS sent to all recipients.');
		})
		.catch(function(error) {
			console.log(error);
		});

	}

	function warning(delay) {
		_warningLamp.turnOn();
		_warningTimer.setTimer(delay, _warningLamp.turnOff);
	}

	function movement(sensor) {

		if (_active) {
			console.log('Movement on sensor', sensor.name, '...');

			if (_awake) {
				alert('Rörelse i huset.');
				warning(60000 * 30);
			}

			_awake = false;

			// Wake up after X minutes
			_timer.setTimer(60000 * 5, function() {
				_awake = true;
			});
		}


	}

	function listen() {
		_switch.on('ON', function() {
			warning(5000);

			if (!_active) {
				_active = true;
				_awake  = true;

				console.log('Alerts activated.');
				alert('Larm aktiverat.');

			}
		});

		_switch.on('OFF', function() {
			warning(5000);

			if (_active) {
				_active = false;

				console.log('Alerts deactivated.');
				alert('Larm avaktiverat.');

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

		_doorbell.on('ON', function() {
			alert('Det ringer på dörren.');
			
			// Make sure we don't get too many events at once
			_doorbell.pauseEvents(60000);
		});

	}


	function run() {

		console.log('Alert module loaded.');

		tellstick.socket.once('connect', function() {
			warning(2000);

			listen();
		});
	}

	run();
}

module.exports = new Module();
