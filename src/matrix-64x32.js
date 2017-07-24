#!/usr/bin/env node


var ClockAnimation    = require('./clock-animation.js');
var QuotesAnimation   = require('./quotes-animation.js');
var NewsAnimation     = require('./news-animation.js');
var GifAnimation      = require('./gif-animation.js');
var WeatherAnimation  = require('./weather-animation.js');
var ExchangeAnimation = require('./exchange-animation.js');

var Matrix            = require('./matrix.js');


var animations = [];

animations.push(ClockAnimation);
animations.push(NewsAnimation);

animations.push(ClockAnimation);
animations.push(QuotesAnimation);

animations.push(ClockAnimation);
animations.push(WeatherAnimation);

animations.push(ClockAnimation);
animations.push(ExchangeAnimation);

var matrix = module.exports = new Matrix('http://app-o.se/hzeller-matrix-64x32', animations);
