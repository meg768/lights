#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var Path = require('path');
var sprintf = require('yow/sprintf');
var mkpath = require('yow/fs').mkpath;
var isObject = require('yow/is').isObject;
var prefixLogs = require('yow/logs').prefix;


class App  {

	foo() {
		console.log('asdgf');
	}

};

var x = new App();
x.foo();
