#!/usr/bin/env node


var ClockAnimation  = require('./clock-animation.js');
var QuotesAnimation = require('./quotes-animation.js');
var NewsAnimation   = require('./news-animation.js');
var GifAnimation    = require('./gif-animation.js');
var Matrix          = require('./matrix.js');


var animations = [];

animations.push(new ClockAnimation(matrix));
animations.push(new GifAnimation(matrix));

animations.push(new ClockAnimation(matrix));
animations.push(new NewsAnimation(matrix));

animations.push(new ClockAnimation(matrix));
animations.push(new GifAnimation(matrix));

animations.push(new ClockAnimation(matrix));
animations.push(new QuotesAnimation(matrix));

var matrix = module.exports = new Matrix('http://85.24.190.138:3003/hzeller-matrix', animations);
