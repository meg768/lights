#!/usr/bin/env node

var Matrix            = require('./matrix.js');
var ClockAnimation    = require('./clock-animation.js');
var NewsAnimation     = require('./news-animation.js');
var GifAnimation      = require('./gif-animation.js');
var WeatherAnimation  = require('./weather-animation.js');
var AvanzaAnimation   = require('./avanza-animation.js');
var SolarAnimation    = require('./solar-animation.js');





var animations = [];

animations.push(ClockAnimation);
animations.push(WeatherAnimation);

animations.push(SolarAnimation);
animations.push(GifAnimation);

animations.push(ClockAnimation);
animations.push(NewsAnimation);

animations.push(SolarAnimation);
animations.push(GifAnimation);

animations.push(ClockAnimation);
animations.push(AvanzaAnimation);

animations.push(SolarAnimation);
animations.push(GifAnimation);



var matrix = module.exports = new Matrix('http://app-o.se/matrix?instance=32x32', animations);
