process.env.PORT = 3000;
process.env.IP = 'localhost';

var bodyParser = require('body-parser'),
	express    = require('express'),
	mysql 	   = require('mysql');

var app = express();
var connection = mysql.createConnection({
  host     : 'enoch-database.cczojh0jth8p.us-east-1.rds.amazonaws.com',
  user     : 'enoch',
  password : '13092952156',
  port     : 3306,
  database: 'world' 
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

app.get('/', (req, res) => {
	res.render('landing');
});


app.post('/cities', (req, res) => {
	let post = res;
	let country_name = req.body.country_name;
	let sql = 
		  'SELECT Name, District, Population ' + 
          'FROM city ' + 
          'WHERE CountryCode = ' + 
          '(SELECT Code FROM country WHERE Name = ?)';
    let param = country_name; 
    connection.query(sql, param, (err, res) => {
		if(err) console.log(err);
		if(res == '') console('empty');
  		post.render('cities', {results : res});
	});
});

app.post('/language', (req, res) => {
	let post = res;
	let language = req.body.language;
	let sql = 
		  'SELECT Name ' + 
          'FROM country ' + 
          'WHERE Code IN ' + 
          '(SELECT CountryCode FROM countrylanguage WHERE Language = ?)';
    let param = language; 
    connection.query(sql, param, (err, res) => {
		if(err) console.log(err);
		if(res == '') console('empty');
  		post.render('language', {results : res});
	});
});

app.listen(process.env.PORT, process.env.IP, () => {
    console.log('Demo Started');
})
