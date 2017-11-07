const express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    config = require('konfig')().app,
    cookieParser = require('cookie-parser'),
    Logger = require('./logger');

const app = express();
const log = new Logger(app);

app.use(cors({ origin: '*' }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));

const PublicAPIController = require('./controllers')();
app.use('/api', new PublicAPIController(config).setupRouter(express.Router()));

app.use(express.static('public'));

app.get("*", function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

//handle HTTP errors
app.use(function(err, req, res, next) {
    console.log(err);

    if(!res.headersSent){
        res
          .status(err.statusCode || 500)
          .send(err.message)
          .end();
    }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
