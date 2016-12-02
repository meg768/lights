#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var Path = require('path');
var sprintf = require('yow/sprintf');
var mkpath = require('yow/fs').mkpath;
var isObject = require('yow/is').isObject;
var prefixLogs = require('yow/logs').prefix;


var App = function() {

	function foo() {
		return new Promise(function(resolve, reject) {
			console.log('Waiting');
			setTimeout(function() {
				resolve('KALLE');
			}, 2000);
		});
	}
	function run() {

		var x = await(foo());
		console.log('Done');



	};

	run();

};

module.exports = new App();
