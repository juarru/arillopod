/* Import packages */
require("dotenv").config();
var MongoClient = require("mongodb").MongoClient;
var request = require('request');
var csvwriter = require('csv-writer');
var fs = require('fs');

// Connecting to MongoDB and retrieving data.
var url = "mongodb://" + process.env.MG_USER + ":" + process.env.MG_PWD + "@" + process.env.MG_HOST + ":" + process.env.MG_PORT + "/" + process.env.MG_DATABASE;
console.log(url);
// MongoClient.connect(url, { useNewUrlParser: true },  function (err, db) {
//     if(!err){
//         console.log("Connection OK");
//     } else {
//         console.log(err);
//     }
//
//     // Getting collection data
//     var dbo = db.db(process.env.MG_DATABASE);
//     dbo.collection(process.env.MG_COLLECTION).findOne({'call.startTime': {$gte: new Date('2018-05-01 00:00:00'), $lte: new Date('2018-05-01 23:59:59') }}, function (err, result) {
//         if (err) throw err;
//         console.log(result);
//     });
//
//     db.close();
// });

// Retrieving data from API and writing into CSV file
get_api_values().then(save_api_values);

/* ---- Auxiliar functions ---- */
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

