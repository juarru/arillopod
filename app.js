/* Import packages */
require("dotenv").config();
var MongoClient = require("mongodb").MongoClient;
var request = require('request');
var csvwriter = require('csv-writer');
var fs = require('fs');

get_mongo_values();
// get_api_values().then(save_api_values);

/* ---- Auxiliar functions ---- */
function get_mongo_values() {
	// Connecting to MongoDB and retrieving data.
	var url = "mongodb://" + process.env.MG_USER + ":" + process.env.MG_PWD + "@" + process.env.MG_HOST + ":" + process.env.MG_PORT + "/" + process.env.MG_DATABASE;
	console.log(url);
	MongoClient.connect(url, { useNewUrlParser: true },  function (err, db) {
		if(!err){
			console.log("Connection OK");
		} else {
			console.log(err);
		}

		// Getting collection data
        try {
			var dbo = db.db(process.env.MG_DATABASE);
			var mongo_data = dbo.collection(process.env.MG_COLLECTION).find({'call.startTime': {$gte: '2018-05-01 00:00:00', $lte: '2018-05-01 23:59:59' }, 'call.endTime' : {$gte: '2018-05-01 00:00:00', $lte: '2018-05-01 23:59:59'}}).toArray();
			console.log(mongo_data);
        } catch (e) {
            console.log(e);
		}
		db.close();
	});
}

function get_api_values(){
    // Connecting to API
    var options = {
        url: process.env.API_URL + '?customer=all&endTime=2018-05-01 00:00:00,2018-05-01 23:59:59&startTime=2018-05-01 00:00:00,2018-05-01 23:59:59&output=csv',
        method: process.env.API_METHOD,
        headers: {
            'User-Agent': 'request'
        }
    };
    return new Promise(function(resolve, reject) {
        // Do async job
        request(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        })
    });
}

function save_api_values(data) {
    try {
        fs.writeFile("csv/api_data.csv", data, function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
    } catch (e) {
        console.log(e);
    }
}

