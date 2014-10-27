var express = require('express'),http= require('http');
var bodyParser = require('body-parser')
var redis=require('redis');
var app = express();
var server = app.listen(8080);
var io = require('socket.io').listen(server);

client = redis.createClient();

//app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(express.static("public", __dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {

res.render('index.ejs', null);

});


app.post ('/upload', function(req, res) {
    console.log(req.body);
    // res.send(req.body.text);
    io.sockets.emit('faitUneAlerte',req.body.text);
    client.lpush('list',req.body.text);

     res.render('index.ejs', null)

});

app.get ('/load', function(req, res) {
    //console.log(req.body);
    // res.send(req.body.text);
    client.lrange('list',0,-1, function (err, reply){console.log(reply)
    //io.sockets.on('connection', function (socket) {
        //io.sockets.emit('faitUneAlerte');
        //console.log('event parti')
    //});

        res.render('client.ejs', {message: reply}) });

});







