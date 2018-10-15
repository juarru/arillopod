/* Import packages */
require("dotenv").config();
var MongoClient = require("mongodb").MongoClient;

// Connecting to MongoDB
var url = "mongodb://" + process.env.MG_USER + ":" + process.env.MG_PWD + "@" + process.env.MG_HOST + ":" + process.env.MG_PORT + "/" + process.env.MG_DATABASE;
console.log(url);
MongoClient.connect(url, { useNewUrlParser: true },  function (err, db) {
    if(!err){
        console.log("Connection OK");
    }

    // Getting collection data
    var dbo = db.db(process.env.MG_DATABASE);
    dbo.collection(process.env.MG_COLLECTION).find({ "call.startTime": { $gt : '2018-05-01 00:00:00'}, "call.endTime": {$lt: '2018-05-01 23:59:59'}}, function (err, result) {
        if (err) throw err;
        console.log(result);
    });

    db.close();
});

