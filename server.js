var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
const querystring = require('querystring');
var MongoClient = require('mongodb').MongoClient;
var dburl = "mongodb://localhost:3001/";
app.use(cors());

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/getRid',function (req,res) {
    var myobj = querystring.parse(req.url.split('?')[1]);
    MongoClient.connect(dburl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        var query = {
            "name" : new RegExp(`${myobj.roomId}`)
        }
        dbo.collection('rocketchat_room').find(query).toArray(function(err, result) { // 返回集合中所有数据
            if (err) throw err;
            // console.log(result);
            res.send(result);
            db.close();
        })
    })
})

app.get('/findChatsByRoom', function (req, res) {
    // console.log("/findChatsByRoom GET 请求");
    var myobj = querystring.parse(req.url.split('?')[1]);
    MongoClient.connect(dburl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        var query = {
            "rid" : new RegExp(`${myobj.roomId}`)
            // deep learning
        }
        dbo.collection("rocketchat_message"). find(query).toArray(function(err, result) { // 返回集合中所有数据
            if (err) throw err;
            // console.log(result);
            res.send(result);
            db.close();
        });
    });
})

function dboQuery(dbo, findBy, query){
    dbo.collection(`${findBy}`).find(query).toArray();
}

app.get('/findChatsByDate', function (req, res) {
    //console.log("/findChatsByRoom GET 请求,",req.url);
    var myobj = querystring.parse(req.url.split('?')[1]);
    let start_time = myobj.starttime;
    let end_time = myobj.endtime;
    MongoClient.connect(dburl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        var query = {
            "ts" : {
                "$gte":new Date(start_time),
                "$lte":new Date(end_time)
            },
            "rid" : new RegExp(`${myobj.roomId}`)
        }
        dbo.collection("rocketchat_message"). find(query).toArray(function(err, result) { // 返回集合中所有数据
            if (err) throw err;
            // console.log(result);
            res.send(result);
            db.close();
        });
    });
})

app.get('/insertSummary', function (req, res) {
    // console.log('origin:',querystring.parse(req.url));
    var myobj = querystring.parse(req.url.split('?txt=')[1]);
    console.log(Object.keys(myobj)[0])
    var newObj = {
        "txt": myobj.txt,
        "origin":myobj.origin,
        "rid":myobj.rid,
        "ts":myobj.ts,
        "username":myobj.username
    }
    // myobj = JSON.parse(myobj)
    MongoClient.connect(dburl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        dbo.collection("rocketchat_summary"). insertOne(JSON.parse(Object.keys(myobj)[0]),function(err, result) { // 返回集合中所有数据
            if (err) throw err;
            console.log("insert successfully");
            //res.send(result);
            db.close();
        });
    });
})

app.get('/findSummaryByKey', function (req, res) {
    // console.log("/findChatsByRoom GET 请求");
    var myobj = querystring.parse(req.url.split('?')[1]);
    console.log('find:',myobj)
    MongoClient.connect(dburl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        var query = {
            "txt.content" : new RegExp(`.*${myobj.key}.*`),
            "rid" : new RegExp(`.*${myobj.roomId}.*`)
        }
        dbo.collection("rocketchat_summary"). find(query).project({txt:1}).toArray(function(err, result) { // 返回集合中所有数据
            if (err) throw err;
            console.log(result);
            res.send(result);
            db.close();
        });
    });
})

app.get('/findSummaryByUser', function (req, res) {
    // console.log("/findChatsByRoom GET 请求");
    var myobj = querystring.parse(req.url.split('?')[1]);
    MongoClient.connect(dburl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        var query = {
            "txt.members":new RegExp(`.*${myobj.username}.*`),
            "rid" : new RegExp(`.*${myobj.roomId}.*`)
        }
        // console.log(query)
        dbo.collection("rocketchat_summary"). find(query).project({txt:1}).toArray(function(err, result) { // 返回集合中所有数据
            if (err) throw err;
            // console.log(result);
            res.send(result);
            db.close();
        });
    });
})

app.get('/findSummarysByDate', function (req, res) {
    // console.log("/findChatsByRoom GET 请求,",req.url);
    var myobj = querystring.parse(req.url.split('?')[1]);
    MongoClient.connect(dburl, function(err, db) {
        if (err) throw err;
        var dbo = db.db("meteor");
        var query = {
            "rid" : new RegExp(`.*${myobj.roomId}.*`)
        }
        dbo.collection("rocketchat_summary"). find(query).toArray(function(err, result) { // 返回集合中所有数据
            if (err) throw err;
            console.log(result);
            res.send(result);
            db.close();
        });
    });
})


var server = app.listen(2000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})
