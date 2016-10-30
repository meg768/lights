var Schedule = require('node-schedule');
var FeedParser = require('feedparser');
var Request = require('request');

var sprintf  = require('yow').sprintf;
var random  = require('yow').random;

var tellstick  = require('./tellstick.js');
var matrix     = require('socket.io-client')('http://app-o.se:3000/matrix-display');

var Module = module.exports = function() {

	var _lightSensor    = tellstick.getDevice('SR-01');
	var _newsSwitch     = tellstick.getDevice('VS-02');
	var _motionSensor   = tellstick.getDevice('RV-01');

	function debug(msg) {
		console.log(msg);
	}
/*
	{url: 'http://www.vafinans.se/rss/nyheter', name: 'Veckans Affärer'},
	{url: 'http://www.di.se/rss', name: 'Dagens Industri'},
	{url: 'http://www.sydsvenskan.se/rss.xml', name: 'Sydsvenskan'},
	{url: 'http://www.svd.se/?service=rss&type=senastenytt', name: 'SvD'},
	{url: 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss', name: 'Google'}
*/
	function fetchNews() {
		var feeds = {
			'di': {
				url: 'http://di.se/rss'
			},
			'google': {
				url: 'https://news.google.se/news?cf=all&pz=1&ned=sv_se&ict=ln&num=5&output=rss'
			},
			'sydsvenskan': {
				url: 'http://www.sydsvenskan.se/rss.xml'
			}
		};


		var request = Request(feeds['di'].url);
		var parser  = new FeedParser();

		matrix.emit('stop');

		request.on('response', function (result) {

			if (result.statusCode != 200) {
				console.log('error code', result.statusCode );
			}
			else {
				this.pipe(parser);
			}

		});

		parser.on('error', function(error) {
			console.log(error);
		});

		parser.on('readable', function() {
			var item = undefined;
			var news = [];

			while (item = this.read()) {
				news.push({title:item.title, date:item.pubdate});
			}


			news = news.slice(0, 1);

			news.forEach(function(item) {
				console.log('X', item);
				//matrix.emit('text', {text:item.title});
			});

		});

	};


	function listen() {


		_newsSwitch.on('ON', function() {
			console.log('Reading the news');
			fetchNews();
//			matrix.emit('animation', {priority:'high', duration:120, name:random(['tree','pacman','pong','boat','fireplace','reduction', 'bubbles', 'crystal', 'dancer', 'haze', 'orbit', 'robot-factory'])});
		});

		_newsSwitch.on('OFF', function() {
			matrix.emit('stop');
		});




	}

	function run() {

		listen();
	}

	run();
}
