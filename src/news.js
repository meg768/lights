var sprintf    = require('yow/sprintf');
var random     = require('yow/random');
var isArray    = require('yow/is').isArray;
var isString   = require('yow/is').isString;


var News = module.exports = function() {

	var _this = this;

	_this.fetch = function(url) {

		var FeedParser   = require('feedparser');
		var Request      = require('request');

		return new Promise(function(resolve, reject) {
			var news = [];
			var parser  = new FeedParser();
			var request = Request(url);

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

};
