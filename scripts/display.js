var Schedule = require('node-schedule');
var FeedParser = require('feedparser');
var Request = require('request');

var sprintf  = require('yow').sprintf;
var random  = require('yow').random;

var tellstick  = require('./tellstick.js');
var matrix     = require('socket.io-client')('http://app-o.se:3000/matrix-display');


var NewsFeed = function() {

	var _index = 0;

	var _feeds = [
		{
			name: 'Dagens Industri',
			url: 'http://di.se/rss',
			textColor: 'red',
		},
		{
			name: 'Google',
			url: 'https://news.google.se/news?cf=all&pz=1&ned=sv_se&ict=ln&num=5&output=rss',
			textColor: 'blue'
		},
		{
			name: 'Sydsvenskan',
			url: 'http://www.sydsvenskan.se/rss.xml',
			textColor: 'rgb(255, 0, 255)'
		},
		{
			name: 'Veckans Affärer',
			url: 'http://www.vafinans.se/rss/nyheter',
			textColor: 'green'

		}
	];


	this.fetch = function() {

		return new Promise(function(resolve, reject) {
			var news = [];
			var provider = _feeds[_index++ % _feeds.length];
			var timer = undefined;
			var request = Request(provider.url);
			var parser  = new FeedParser();

			request.on('response', function (result) {

				if (result.statusCode != 200) {
					reject(new Error('Invalid status code'));
				}
				else {
					this.pipe(parser);
				}

			});

			parser.on('error', function(error) {
				reject(error);
			});

			parser.on('readable', function() {
				var item = undefined;

				while (item = this.read()) {
					news.push({title:item.title, date:item.pubdate});
				}

				if (timer != undefined)
					clearTimeout(timer);

				timer = setTimeout(function() {
					resolve({provider:provider, news:news.splice(0, 3)});
				}, 2000);

			});

		});

	};


};

var AnimationFeed = function() {

};


var Module = module.exports = function() {

	var _lightSensor     = tellstick.getDevice('SR-01');
	var _newsSwitch      = tellstick.getDevice('FK-00-01');
	var _animationSwitch = tellstick.getDevice('FK-00-02');
	var _emojiSwitch     = tellstick.getDevice('FK-00-03');
	var _motionSensor    = tellstick.getDevice('RV-02');

	var _newsFeed        = new NewsFeed();

	function debug(msg) {
		console.log(msg);
	}

	matrix.on('idle', function() {
		console.log('IDLE!');
	});

	function displayNews(priority) {

		if (!priority)
			priority = 'normal';

		_newsFeed.fetch().then(function(news) {

			news.news.forEach(function(newsItem) {
				console.log(newsItem);
				matrix.emit('text', {text:newsItem.title, textColor:news.provider.textColor});
			});

		})
		.catch(function(error) {
			console.log('Failed fetching news.', error);

		});

		matrix.emit('emoji', {id:123, priority:priority});
	};

	function scheduleNews() {
		var rule = new Schedule.RecurrenceRule();
		rule.minute = new Schedule.Range(3, 59, 5);

		Schedule.scheduleJob(rule, function() {
			displayNews('high');
		});
	};

	function displayAnimation(priority) {

		function runPerlin() {
			matrix.emit('perlin', {mode:1, priority:priority, duration:60});
		};

		function runRain() {
			matrix.emit('rain', {priority:priority, duration:240});
		};

		function runAnimation() {
			matrix.emit('animation', {priority:priority, duration:60, name:random(['tree','pacman','pong','boat','fireplace','reduction', 'bubbles', 'crystal', 'dancer', 'haze', 'orbit', 'robot-factory'])});
		}

		var animation = random([runPerlin, runRain, runAnimation, runRain]);
		animation();
	}

	function scheduleAnimations() {
		var rule = new Schedule.RecurrenceRule();
		rule.hour   = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
		rule.minute = new Schedule.Range(0, 59, 1);
		rule.second = 15;

		Schedule.scheduleJob(rule, function() {
			displayAnimation('low');
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
		options.textColor   = sprintf('rgb(%d, %d, %d)', color.red, color.green, color.blue);
		options.text        = sprintf('%02d:%02d', now.getHours(), now.getMinutes());
		options.fontSize    = 22;
		options.speed       = 0.70;
		options.priority    = priority;

		matrix.emit('text', options);

	};


	function scheduleClock(callback) {


		var rule = new Schedule.RecurrenceRule();
		rule.minute = new Schedule.Range(0, 59, 1);
		rule.second = [0, 30];

		Schedule.scheduleJob(rule, function() {
			displayClock('low');
		});
	}

	function listen() {
		scheduleClock();
		scheduleNews();
		scheduleAnimations();

		_motionSensor.on('ON', function() {
			_motionSensor.pauseEvents(30000);
			displayAnimation('high');
		});


		_newsSwitch.on('ON', function() {
			_newsSwitch.pauseEvents(1000);
			displayNews('high');
		});

		_animationSwitch.on('ON', function() {
			_animationSwitch.pauseEvents(1000);
			displayAnimation('high');
		});

		_emojiSwitch.on('ON', function() {
			_emojiSwitch.pauseEvents(1000);
			matrix.emit('emoji', {priority:'high', id:random(1, 846), pause:1});
		});

		_newsSwitch.on('OFF', function() {
			_newsSwitch.pauseEvents(1000);
			displayClock('high');
		});




	}

	function run() {

		listen();
	}

	run();
}
