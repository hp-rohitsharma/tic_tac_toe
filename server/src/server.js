var fs = require('fs');
var http = require('http');
var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var computer = require('./computer');

var path = require('path');

let userRepo = require('./repo');

var app = express();
app.use(bodyParser.json());
app.use(express.static(path.join('./', 'webapp')));

// For http
var httpServer = http.createServer(app);
httpServer.listen(2020);

// Web socket support
require('./websocket-server').init(httpServer);
require('./middlewares/root')(app);

app.get('/play', function (request, response) {
	userRepo[request.ip] =  request.connection;
	response.sendFile( "index.html", { root: './webapp/' });
});

app.get('/practice', function (request, response) {
	computer.practice(50000);
	response.send({ });
});
