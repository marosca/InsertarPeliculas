var express = require('express'),
app = express(),
engines = require('consolidate'),
MongoClient = require('mongodb').MongoClient,
assert = require('assert'),
bodyParser = require('body-parser');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));

var urlLocal ='mongodb://localhost:27017/video';
var urlAtlas = 'mongodb://perdisita:01062011Perdisita@perdisita-shard-00-00-bmzl8.mongodb.net:27017,perdisita-shard-00-01-bmzl8.mongodb.net:27017,perdisita-shard-00-02-bmzl8.mongodb.net:27017/video?ssl=true&replicaSet=perdisita-shard-0&authSource=admin';

// Handler for internal server errors
function errorHandler(err, req, res, next) {
	console.error(err.message);
	console.error(err.stack);
	res.status(500);
	res.render('error', { error: err });
}



	MongoClient.connect(urlAtlas, function(err, db) {
		assert.equal(null, err);
		console.log("Successfully connected to MongoDB.");


		app.get('/', function(req, res, next) {
			res.render('add_movie');
		});

		app.post('/', function(req, res, next) {
			var obj = req.body;

			if (obj.title == '' || obj.year == '' || obj.imdb == '') {
				//next(Error('¡Por favor introduce !'));
				res.render('add_movie', {
					'error': 'Por favor introduce los datos',
					'obj': obj
				});

			} else if ( isNaN(obj.year) ) {
				res.render('add_movie', {
					'error': 'El año debe ser un número',
					'obj': obj
				});

			} else {
				db.collection('movies').insertOne({
					title: obj.title,
					year: Number(obj.year),
					imdb: obj.imdb
				}, function(err, response){
					console.log("Pelicula con id %s insertada", response.insertedId);
					res.render('add_movie', {'complete' : 'ok', 'title': obj.title});
					obj = 'undefined';
					//res.redirect('/');
				});
			}
		});


		app.use(function(req, res){
			res.sendStatus(404);
		});
		var server = app.listen(8080, function() {
			var port = server.address().port;
			console.log('Express server escuchando en %s.', port);
		});


	});

	app.use(errorHandler);
