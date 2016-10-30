var Schedule = require('node-schedule');
var FeedParser = require('feedparser');
var Request = require('request');

var sprintf  = require('yow').sprintf;
var random  = require('yow').random;

var tellstick  = require('./tellstick.js');
var matrix     = require('socket.io-client')('http://app-o.se:3000/matrix-display');

var Module = module.exports = function() {

	var _lightSensor    = tellstick.getDevice('SR-01');
	var _newsSwitch     = tellstick.getDevice('FK-00-01');
	var _motionSensor   = tellstick.getDevice('RV-01');
	var _newsFeed        = 0;

	function debug(msg) {
		console.log(msg);
	}


	function fetchNews(feed) {

		var newsFeeds = [
			{
				url: 'http://di.se/rss',
				textColor: 'red',
			},
			{
				url: 'https://news.google.se/news?cf=all&pz=1&ned=sv_se&ict=ln&num=5&output=rss',
				textColor: 'blue'
			},
			{
				url: 'http://www.sydsvenskan.se/rss.xml',
				textColor: 'rgb(255, 0, 255)'
			},
			{
				url: 'http://www.vafinans.se/rss/nyheter',
				textColor: 'green'

			}

		];


		var provider = newsFeeds[(_newsFeed++) % newsFeeds.length];
		var news = [];
		var timer = undefined;
		var request = Request(provider.url);
		var parser  = new FeedParser();


		function displayNews() {
			news = news.splice(0, 3);

			news.forEach(function(newsItem) {
				console.log(newsItem);
				matrix.emit('text', {text:newsItem.title, textColor:provider.textColor});
			});

		};

		matrix.emit('emoji', {id:123, priority:'high'});

		request.on('response', function (result) {

			if (result.statusCode != 200) {
				console.log('Request error code', result.statusCode);
			}
			else {
				this.pipe(parser);
			}

		});

		parser.on('error', function(error) {
			console.log('Parser error', error);
		});

		parser.on('readable', function() {
			var item = undefined;

			while (item = this.read()) {
				news.push({title:item.title, date:item.pubdate});
			}

			if (timer != undefined)
				clearTimeout(timer);

			timer = setTimeout(displayNews, 2000);

		});

	};


	function listen() {


		_newsSwitch.on('ON', function() {
			_newsSwitch.pauseEvents(2000);
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
