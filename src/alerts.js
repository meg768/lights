var sprintf    = require('yow/sprintf');
var Timer      = require('yow/timer');
var tellstick  = require('./tellstick.js');
var pushover   = require('./pushover.js');

var Module = function() {

	var _active = false;
	var _awake  = true;
	var _switch = tellstick.getDevice('VS-05');
	var _cellarSensor = tellstick.getDevice('RV-02');
	var _officeSensor = tellstick.getDevice('RV-01');
	var _livingRoomSensor = tellstick.getDevice('RV-03');
	var _doorbell = tellstick.getDevice('RK-01');

	var _timer = new Timer();

	var _warningTimer = new Timer();
	var _warningLamp = tellstick.getDevice('VS-02');


	function alert(text) {
		pushover.send({message:text});
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
				warning(60000 * 20);
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
