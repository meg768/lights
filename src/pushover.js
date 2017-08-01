


var Pushover = function() {

	this.send = function(message) {
		/*
			message.message  = 'Hej';
			message.title    =  "Well";
			message.sound    =  'magic';
			message.device   =  'iphone';
			message.priority = 0;
		*/

		var Pushover = require('pushover-notifications');
		var config = require('./config.js');

		var push = new Pushover({user:config.pushover.user, token:config.pushover.token});

		push.send(message, function(error, result) {
			if (error) {
				console.error(error);
			}
		});
	}


};

module.exports = new Pushover();
