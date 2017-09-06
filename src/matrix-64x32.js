#!/usr/bin/env node

var Matrix            = require('./matrix.js');
var ClockAnimation    = require('./clock-animation.js');
var NewsAnimation     = require('./news-animation.js');
var WeatherAnimation  = require('./weather-animation.js');
var AvanzaAnimation   = require('./avanza-animation.js');
var SolarAnimation    = require('./solar-animation.js');


//var matrix = module.exports = new Matrix('http://app-o.se/matrix-64x32', [ClockAnimation, AvanzaAnimation, SolarAnimation, WeatherAnimation, NewsAnimation]);

var matrix = module.exports = new Matrix('http://app-o.se/matrix-64x32', [AvanzaAnimation]);
