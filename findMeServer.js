var express = require('express'),http= require('http');
var bodyParser = require('body-parser')
var redis=require('redis');
var app = express();
var server = app.listen(process.env.PORT || 8080);
var io = require('socket.io').listen(server);

var uuid= require('node-uuid');


if (process.env.REDISTOGO_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    client = redis.createClient(rtg.port, rtg.hostname);

    client.auth(rtg.auth.split(":")[1]);
} else {
    client = redis.createClient();
}

//app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(express.static("public", __dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {

res.render('index.ejs', null);

});

app.get('/newsession', function(req, res) {
    var sessionID=uuid.v4();
    console.log(sessionID);
    sessionID=sessionID.replace(/-/g, '');
    console.log(sessionID);
    client.set('opensession'+sessionID,'ok')
    client.expire('opensession'+sessionID,60000)
    //res.render('newSession.ejs', {session:'http://192.168.0.118:8080/load/'+sessionID});
    res.json({session:'http://192.168.0.108:8080/load/'+sessionID});


});



/*
* Socket, the mobile phone sends the data to this page
* */

 app.post ('/upload/', function(req, res) {
    console.log(req.body);
     console.log(req.body.session);
     console.log(req.body.text);

      // res.send(req.body.text);
    var session=req.body.session

     //changer fait une alerte pour la bone room
    //io.sockets.emit('faitUneAlerte',req.body.text);//emit an alert with the new value received
     console.log('emiting to session :'+req.body.session)
     io.sockets.emit(req.body.session,req.body.text);
    client.lpush(session,req.body.text, function (err, res) {
        console.log(res);
        if(res==1){
                    client.get('opensession'+session,function(err,value){
                        if(value=='ok'){
                            console.log('setting key timeout')
                            client.expire(session,6*60*60*1000);
                        }
                        else{
                            console.log('deleting')
                            client.del(session);
                        }
                    })


        }
       //to be removed

    });//sends the data to redis

     res.json({status:'Location Received'})

});

/*
* Pag seen by the clients
* Pull the data from redis and sent them to the client page
* */
app.get ('/load/:sessionId', function(req, res) {
        var followingSession=req.params.sessionId;

    client.lrange(followingSession,0,-1, function (err, reply){

       console.log("old point" +reply);
        res.render('client.ejs', {message: reply,session:followingSession}) });

});




