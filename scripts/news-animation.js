var sprintf    = require('yow').sprintf;
var random     = require('yow').random;
var isArray    = require('yow').isArray;
var isString   = require('yow').isString;

var tellstick  = require('./tellstick.js');


var NewsAnimation = module.exports = function(matrix) {

	var _index = 0;

	var _feeds = [
		{
			name: 'Dagens Industri',
			url: 'http://di.se/rss',
			color: 'red',
		},
		{
			name: 'Google',
			url: 'https://news.google.se/news?cf=all&pz=1&ned=sv_se&ict=ln&num=5&output=rss',
			color: 'blue'
		},
		{
			name: 'Sydsvenskan',
			url: 'http://www.sydsvenskan.se/rss.xml',
			color: 'rgb(255, 0, 255)'
		},
		{
			name: 'Veckans Affärer',
			url: 'http://www.vafinans.se/rss/nyheter',
			color: 'green'

		}
	];


	function fetchNews(url, path, query) {

		var FeedParser   = require('feedparser');
		var Request      = require('request');
		var URI          = require('urijs');

		return new Promise(function(resolve, reject) {
			var news = [];
			var uri     = new URI(url);
			var parser  = new FeedParser();

			if (path)
				uri.directory(path);

			if (query)
				uri.query(query);

			var request = Request(uri.toString());

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

			parser.on('end', function() {
				resolve(news);
			});

			parser.on('readable', function() {
				var item = undefined;

				while (item = this.read()) {
					news.push(item);
				}
			});

		});
	};


	this.run = function(priority) {

		if (!priority)
			priority = 'normal';

		return new Promise(function(resolve, reject) {

			console.log('Displaying news...');

			var feed = _feeds[_index++ % _feeds.length];

			matrix.emit('emoji', {id:123, priority:priority});

			fetchNews(feed.url).then(function(news) {

				news = news.splice(0, 5);

				news.forEach(function(item) {
					matrix.emit('text', {text:item.title, textColor:feed.color});
				});

				resolve();
			})
			.catch(function(error) {
				reject(error);
			});

		});

	};


};
