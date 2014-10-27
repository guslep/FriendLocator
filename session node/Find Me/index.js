/**
 * Created by Gus on 10/6/2014.
 */


//var httpServer=require("./node server")
//var router= require("./router")
//httpServer.start(router.route);

var server = require("./node server");
var router = require("./router");
var requestHandler=require("./requestHandler")

var handle = {}
handle["/"] = requestHandler.start;
handle["/start"] = requestHandler.start;
handle["/upload"] = requestHandler.upload;
handle["/show"]=requestHandler.show;

server.start(router.route,handle);

