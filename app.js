/* Import packages */
require("dotenv").config();
var MongoClient = require("mongodb").MongoClient;
var request = require('request');
var fs = require('fs');
const csv=require('csvtojson');

get_mongo_values()
    // .then(get_api_values)
    // .then(save_api_values)
    .then(read_stored_csv)
    .then(compare_sources)
    .then(save_final_result);

/* ---- Auxiliar functions ---- */
function get_mongo_values() {
	// Connecting to MongoDB and retrieving data.
	var url = "mongodb://" + process.env.MG_USER + ":" + process.env.MG_PWD + "@" + process.env.MG_HOST + ":" + process.env.MG_PORT + "/" + process.env.MG_DATABASE;
	console.log(url);
	return new Promise(function (resolve, reject) {
        MongoClient.connect(url, { useNewUrlParser: true },  function (err, db) {
            if(!err){
                console.log("Mongo connection OK");
                // Getting collection data
                try {
                    var dbo = db.db(process.env.MG_DATABASE);
                    var rest = [];
                    dbo.collection(process.env.MG_COLLECTION).find({'call.startTime': {$gte: '2018-05-01 00:00:00', $lte: '2018-05-01 23:59:59' }, 'call.endTime' : {$gte: '2018-05-01 00:00:00', $lte: '2018-05-01 23:59:59'}})
                        .toArray(function(err, result) {
                            if (err) {
                                console.log(err);
                            } else if (result.length > 0) {
                                console.log('Getting source 1 data ...');
                                rest.push(result);
                                console.log('Source 1 data retrieved!');
                                db.close();
                                console.log('Mongo connection closed!');
                                resolve(rest);
                            }
                        });
                    // console.log(rest);
                } catch (e) {
                    console.log(e);
                }
            } else {
                console.log(err);
            }
        });
    });
}

function get_api_values(data){
    // Connecting to API
    var options = {
        url: process.env.API_URL + '?customer=all&endTime=2018-05-01 00:00:00,2018-05-01 23:59:59&startTime=2018-05-01 00:00:00,2018-05-01 23:59:59&output=csv',
        method: process.env.API_METHOD,
        headers: {
            'User-Agent': 'request'
        }
    };
    return new Promise(function(resolve, reject) {
        console.log('Getting source 2 data ...');
        // Do async job
        request(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                console.log('Source 2 data retrieved');
                resolve([body,data]);
            }
        })
    });
}

function save_api_values(data) {
    return new Promise(function (resolve, reject) {
        try {
            console.log('Saving source 2 data into csv file ...');
            fs.writeFile("csv/api_data.csv", data[0], function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("The file was saved!");
                    resolve(data[1]);
                }
            });
        } catch (e) {
            console.log(e);
        }
    });
}

function read_stored_csv(data) {
    const csvFilePath='./csv/api_data.csv';
    console.log('Reading source 2 csv data ...');
    return new Promise(function (resolve, reject) {
        console.log('Reading data from csv ...');
        try {
            csv().fromFile(csvFilePath).then((jsonObject) => {
                resolve([data, jsonObject]);
            });
        } catch (e) {
            console.log(e);
        }
    });
}

function compare_sources(data) {
    var result = [];
    return new Promise(function (resolve) {
        console.log('Collating sources ...');
        try {
            data[1].forEach(function (element) {
                var exist = 0;
                var new_iccid = "";
                if(element.iccid.indexOf("'") != -1){
                    new_iccid = element.iccid.replace("'", "");
                } else {
                    new_iccid = element.iccid;
                }
                data[0][0].forEach(function (file) {
                    if(file.iccid == new_iccid && file.call.startTime == element['startTime(UTC)'] && file.call.endTime == element['endTime(UTC)']){
                        exist = 1;
                    }
                });
                if(exist == 0){
                    result.push(element);
                }
            });
            console.log('Retrieved different data');
            resolve(result);
        } catch (e) {
            console.log(e);
        }
    })
}

function save_final_result(data) {
    try {
        console.log('Saving final result into csv file ...');
        fs.writeFile("csv/result.csv", data, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The result was saved!");
            }
        });
    } catch (e) {
        console.log(e);
    }
}