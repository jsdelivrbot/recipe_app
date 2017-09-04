var express = require("express"),
	path = require("path"),
	bodyparser = require("body-parser"),
	cons = require("consolidate"),
	dust = require("dustjs-helpers"),
	pg = require('pg'),
	app = express();

app.set('port', (process.env.PORT || 3000));
// Database configuration
var config = {
	user: 'awsahmed', 
	database: 'recipebookdb',
	password: 'Sansoon3',
	host: 'localhost',
	port: 5432,
	max: 10,
	idleTimeoutMillis: 30000,
}

//Creating the pool:
var pool = new pg.Pool(config);


// Assigne Dust Engine to .dust Files
app.engine('dust', cons.dust);

// Set Default Ext .dust
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

//Body Parser Middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));



// Display all the recipes
app.get('/', function(req, res){
	//Connect the databse:
	pool.connect(function(err, client, done){
		if (err){
			console.error('error fetching client from pool', err);
		}
		client.query('SELECT * FROM recipes', function(err, result){
			if (err){
				console.error('error running query', err);
			}			
			res.render('index', {recipes: result.rows});
			done();
		});
	});
	pool.on('error', function(err, client){
		console.error('idle client error', err.message, err.stack);
	});
});


// Add new recipe
app.post('/add', function(req, res){
	pool.connect(function(err, client, done){
		if (err){
			console.error('error fetching client from pool', err);
		}
		client.query('INSERT INTO recipes (name, ingredients, directions) VALUES($1, $2, $3)', 
			[req.body.name, req.body.ingredients, req.body.directions]);
		done();
		res.redirect('/');
	});
	pool.on('error', function(err, client){
		console.error('idle client error', err.message, err.stack);
	});
});


// Edit existing recipe
app.post('/edit', function(req, res){
	pool.connect(function(err, client, done){
		if(err){
			console.error('error editing record');
		}
		client.query('UPDATE recipes SET name=$1, ingredients=$2, directions=$3 WHERE id=$4', 
			[req.body.name, req.body.ingredients, req.body.directions, req.body.id]);
		done();
		res.redirect('/')
	});
	pool.on('error', function(err, client){
		console.error('idle client error', err.message, err.stack);
	});
});


// Delete a recipe
app.delete('/delete/:id', function(req, res){
	pool.connect(function(err, client, done){
		if (err){
			console.error('error fetching client from pool', err);
		}
		client.query('DELETE FROM recipes WHERE id=$1', 
			[req.params.id]);
		done();
		res.sendStatus(200);
	});
	pool.on('error', function(err, client){
		console.error('idle client error', err.message, err.stack);
	});
})



// Server

app.listen(app.get('port'), function(){
	console.log('Server started on port ', app.get('port'));
})

