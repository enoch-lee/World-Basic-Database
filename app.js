require('dotenv').config();
var bodyParser = require('body-parser'),
	  express    = require('express'),
	  mysql 	   = require('mysql'),
		flash 		 = require('connect-flash');



var app = express();
var connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER ,
  password : process.env.DB_PWD,
  port     : process.env.DB_PORT,
  database : process.env.DB_NAME
});

connection.connect((err) => {
  if(err){
    console.log(err);
    return;
  }
  console.log('Connected to database.');
});

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
//Declare a static directory: Important to reference css files correctly
app.use(express.static(__dirname + '/public'));
app.use(flash());

app.get('/', (req, res) => {
	res.render('landing');
});

app.get('/new_city', (req, res) => {
	res.render('new_city')
});

app.post('/new_city', (req, res) => {
	let sql = 'INSERT INTO city (Name, CountryCode, District, Population) \
						 VALUES (?, (SELECT Code FROM country WHERE Name = ?), ?, ?)';
	let params = [req.body.name, req.body.country, req.body.district, req.body.population];
	connection.query(sql, params, (err) => {
		if(err){
			console.log(err);
		}else{
			console.log('Insert Successfully');
		}
	});
	res.redirect('/')
});

app.get('/edit/:country', (req, res) => {
	let country = req.params.country;
	res.render('editCountry', {country, country});
});

app.post('/edit/country', (req, res) => {
	let sql = 'UPDATE country SET Population = ?, LifeExpectancy = ?, GNP = ? WHERE Name = ?'
	let params = [req.body.population, req.body.lifespan, req.body.gnp, req.body.name];
	connection.query(sql, params, (err) => {
		if(err) console.log(err);
		else console.log('Updated ' + req.body.name + '!');
	});
	//req.flash('info', 'Updated!');
	res.redirect('/country/' + req.body.name, {message: req.flash()});
});

app.get('/cities/delete', (req, res) => {
	res.render('delete');
});

app.post('/cities/delete', (req, res) => {
	let city_name = req.body.city_name;
	let country_name = req.body.country_name;
	let params = [city_name, country_name];
	let sql = 'DELETE FROM city WHERE Name = ? and CountryCode = (SELECT Code FROM country WHERE Name = ?)';
	connection.query(sql, params, (err) => {
		if(err){
			console.log(err);
		}else{
			console.log('Deleted!')
		}
	});
	res.redirect('/');
});

app.get('/allCountries', (req, res) => {
	let post = res;
	let sql = 'SELECT * FROM country ORDER BY Population DESC ';
	connection.query(sql, (err, res) => {
	if(err) console.log(err);
		post.render('allCountries', {results : res});
	});
})

app.get('/country/:country', (req, res) => {
	let post = res;
	let countryName = req.params.country;
	let sql =
			'SELECT * ' +
					'FROM country ' +
					'WHERE Name = ?';
	let params = countryName;
	connection.query(sql, params, (err, res) => {
	if(err) console.log(err);
	//if(res == '') console('empty');
		post.render('country', {results : res});
	});
});


app.post('/country', (req, res) => {
	let route = '/country/' + req.body.countryName;
	res.redirect(route);
})

app.get('/cities/:city', (req, res) => {
	let post = res;
	let cityName = req.params.city;
	let sql =
			'SELECT * ' +
					'FROM city ' +
					'WHERE Name = ?';
	let params = cityName;
	connection.query(sql, params, (err, res) => {
	if(err) console.log(err);
	//if(res == '') console('empty');
		post.render('city', {results : res});
	});
});

app.post('/city', (req, res) => {
	let route = '/cities/' + req.body.cityName;
	res.redirect(route);
});

app.post('/cities', (req, res) => {
	let post = res;
	let countryName = req.body.countryName;
	let sql =
			'SELECT Name, District, Population ' +
					'FROM city ' +
					'WHERE CountryCode = ' +
					'(SELECT Code FROM country WHERE Name = ?)';
	let params = countryName;
	connection.query(sql, params, (err, res) => {
	if(err) console.log(err);
	//if(res == '') console('empty');
		post.render('cities', {results : res, countryName : countryName});
	});
});

app.get('/language/:language', (req, res) => {
	let post = res;
	let language = req.params.language;
	let sql =
				 'select country.Name, country.Code2, countrylanguage.IsOfficial, countrylanguage.Percentage \
					from country, countrylanguage \
					where countrylanguage.Language = ? and countrylanguage.CountryCode = country.Code order by countrylanguage.Percentage DESC';
		let params = language;
		connection.query(sql, params, (err, res) => {
		if(err) console.log(err);
		//if(res == '') console('empty');
			post.render('language', {results : res, language : language});
	});
})

app.post('/language', (req, res) => {
	let route = '/language/' + req.body.language;
	res.redirect(route);
});

app.listen(process.env.PORT, process.env.IP, () => {
    console.log('Demo Started');
})
