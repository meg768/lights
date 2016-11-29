var sprintf    = require('yow/sprintf');
var random     = require('yow/random');
var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;

var MongoDB    = require('mongodb');


var NewsAnimation = module.exports = function(matrix) {

	var _index = 0;


	function getNewsFeeds() {
		return new Promise(function(resolve, reject) {

			MongoDB.connect('mongodb://app-o.se:27017/ljuset').then(function(db) {
				return db.collection('config').findOne({type:'news'});
			})
			.then(function(item) {
				resolve(item.feeds);
			})
			.catch(function (error) {
				reject(error);
			});
		});

	}


	function displayFeed(priority, feeds) {

		return new Promise(function(resolve, reject) {

			var News = require('./news.js');
			var news = new News();

			if (!priority)
				priority = 'normal';

			console.log('Displaying news...');

			var feed = feeds[_index++ % feeds.length];

			matrix.emit('emoji', {id:123, priority:priority});

			news.fetch(feed.url).then(function(news) {

				news = news.splice(0, 5);

				news.forEach(function(item) {
					console.log(item.title);
					matrix.emit('text', {text:item.title, textColor:feed.color});
				});

				resolve();
			})
			.catch(function(error) {
				matrix.emit('text', {text:'Inga nyheter tillgängliga'});
				console.log('Error fetching news.', error);
				resolve();
			});

		});

	};

	this.run = function(priority) {

		return new Promise(function(resolve, reject) {

			getNewsFeeds().then(function(feeds) {
				return displayFeed(priority, feeds);
			})
			.catch(function(error) {
				matrix.emit('text', {text:'Inga nyheter tillgängliga'});
				console.log('Error fetching news.', error);
				resolve();
			});

		});

	};


};
