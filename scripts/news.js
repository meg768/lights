var Schedule = require('node-schedule');
var FeedParser = require('feedparser');
var Request = require('request');

var sprintf  = require('yow').sprintf;
var random  = require('yow').random;

var tellstick  = require('./tellstick.js');
var matrix     = require('socket.io-client')('http://app-o.se:3000/matrix-display');

var Module = module.exports = function() {

	var _lightSensor     = tellstick.getDevice('SR-01');
	var _newsSwitch      = tellstick.getDevice('FK-00-01');
	var _animationSwitch = tellstick.getDevice('FK-00-02');
	var _emojiSwitch     = tellstick.getDevice('FK-00-03');
	var _motionSensor    = tellstick.getDevice('RV-01');
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


	function displayClock(priority) {


		function hslToRgb(h, s, l) {

		    var r, g, b;

		    if (s == 0){
		        r = g = b = l; // achromatic
		    } else{
		        var hue2rgb = function hue2rgb(p, q, t){
		            if(t < 0) t += 1;
		            if(t > 1) t -= 1;
		            if(t < 1/6) return p + (q - p) * 6 * t;
		            if(t < 1/2) return q;
		            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		            return p;
		        }

		        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		        var p = 2 * l - q;
		        r = hue2rgb(p, q, h + 1/3);
		        g = hue2rgb(p, q, h);
		        b = hue2rgb(p, q, h - 1/3);
		    }

		    return {red:Math.round(r * 255), green:Math.round(g * 255), blue:Math.round(b * 255)};

		}

		var now   = new Date();
		var hue   = ((now.getHours() % 12) * 60 + now.getMinutes()) / 2;
		var color = hslToRgb(hue / 360.0, 1, 0.5);

		var options = {};
		options.textColor = sprintf('rgb(%d, %d, %d)', color.red, color.green, color.blue);
		options.text      = sprintf('%02d:%02d', now.getHours(), now.getMinutes());
		options.priority  = priority;

		matrix.emit('text', options);

	}

	function scheduleClock(callback) {
		var rule = new Schedule.RecurrenceRule();
		rule.minute = new Schedule.Range(0, 59, 1);

		Schedule.scheduleJob(rule, function() {
			displayClock('low');
		});
	}

	function listen() {
		scheduleClock();

		_newsSwitch.on('ON', function() {
			_newsSwitch.pauseEvents(2000);
			fetchNews();
		});

		_animationSwitch.on('ON', function() {
			_animationSwitch.pauseEvents(2000);
			matrix.emit('animation', {priority:'high', duration:120, name:random(['tree','pacman','pong','boat','fireplace','reduction', 'bubbles', 'crystal', 'dancer', 'haze', 'orbit', 'robot-factory'])});
		});

		_emojiSwitch.on('ON', function() {
			_emojiSwitch.pauseEvents(2000);
			matrix.emit('emoji', {priority:'high', id:random(1, 846)});
		});

		_newsSwitch.on('OFF', function() {
			matrix.emit('stop');
			displayClock();
		});




	}

	function run() {

		listen();
	}

	run();
}
