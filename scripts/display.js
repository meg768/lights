var sprintf   = require('yow').sprintf;
var random    = require('yow').random;

var tellstick  = require('./tellstick.js');
var matrix     = require('socket.io-client')('http://app-o.se:3000/matrix-display');


var NewsFeed = function() {

	var FeedParser = require('feedparser');
	var Request    = require('request');

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

	var Colors = require('color-convert');
	var Schedule = require('node-schedule');

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
			matrix.emit('rain', {priority:priority, duration:180});
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

		var now   = new Date();
		var hue   = ((now.getHours() % 12) * 60 + now.getMinutes()) / 2;
		var color = Colors.hsl.rgb([hue, 100, 50]);

		var options = {};
		options.textColor   = sprintf('rgb(%d, %d, %d)', color[0], color[1], color[2]);
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
		displayClock('high');
		return;
		scheduleClock();
		scheduleNews();
		scheduleAnimations();

		_motionSensor.on('ON', function() {
			_motionSensor.pauseEvents(30000);

			if (random() < 0.75)
				displayAnimation('high');
			else
				displayNews('high');
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
