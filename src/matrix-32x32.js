#!/usr/bin/env node


var ClockAnimation   = require('./clock-animation.js');
var QuotesAnimation  = require('./quotes-animation.js');
var NewsAnimation    = require('./news-animation.js');
var GifAnimation     = require('./gif-animation.js');
var WeatherAnimation = require('./weather-animation.js');

var Matrix           = require('./matrix.js');



var animations = [];

animations.push(ClockAnimation);
animations.push(WeatherAnimation);

animations.push(ClockAnimation);
animations.push(GifAnimation);

animations.push(ClockAnimation);
animations.push(NewsAnimation);

animations.push(ClockAnimation);
animations.push(GifAnimation);

animations.push(ClockAnimation);
animations.push(QuotesAnimation);

animations.push(ClockAnimation);
animations.push(GifAnimation);


var matrix = module.exports = new Matrix('http://85.24.190.138:3003/hzeller-matrix', animations);
