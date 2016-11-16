#!/usr/bin/env node


var ClockAnimation  = require('./src/clock-animation.js');
var QuotesAnimation = require('./src/quotes-animation.js');
var NewsAnimation   = require('./src/news-animation.js');
var GifAnimation    = require('./src/gif-animation.js');
var Matrix          = require('./src/matrix.js');

var matrix = module.exports = new Matrix('http://85.24.190.138:3003/hzeller-matrix');

var animations = [];

animations.push(new ClockAnimation(matrix));
animations.push(new GifAnimation(matrix));

animations.push(new ClockAnimation(matrix));
animations.push(new NewsAnimation(matrix));

animations.push(new ClockAnimation(matrix));
animations.push(new GifAnimation(matrix));

animations.push(new ClockAnimation(matrix));
animations.push(new QuotesAnimation(matrix));

matrix.runAnimations(animations);
