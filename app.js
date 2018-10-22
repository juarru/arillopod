/* Import packages */
require("dotenv").config();
var MongoClient = require("mongodb").MongoClient;
var request = require('request');
var fs = require('fs');
const csv=require('csvtojson');
const json = require('json-to-csv');
const fileName = './csv/result.csv';

var result =[];
var hour;
async function get_result(){
    for(hour = 9; hour < 10; hour++){
        console.log('Hour: ' + (hour + 1));
        await get_mongo_values(hour.toString)
            .then(get_api_values)
            .then(save_api_values)
            .then(read_stored_csv)
            .then(compare_sources)
            .then(save_final_result);
    }
}

get_result().then(function (){
    try {
        if(result.length > 0){
            json(result, fileName)
                .then(() => {
                    console.log('File result saved!');
                })
                .catch(error => {
                    console.log(error);
                })
        } else {
            console.log('No data found');
        }
    } catch (e) {
        console.log(e);
    }

});


/* ---- Auxiliar functions ---- */
function get_mongo_values() {
	// Connecting to MongoDB and retrieving data.
	var url = "mongodb://" + process.env.MG_USER + ":" + process.env.MG_PWD + "@" + process.env.MG_HOST + ":" + process.env.MG_PORT + "/" + process.env.MG_DATABASE;

	return new Promise(function (resolve, reject) {
	    // Parsing hour value
        var str_hour = '';
        if(hour.toString().length == 1){
            str_hour = '0' + hour.toString();
        } else {
            str_hour = hour.toString();
        }

        MongoClient.connect(url, { useNewUrlParser: true },  function (err, db) {
            if(!err){
                // Getting collection data
                try {
                    var dbo = db.db(process.env.MG_DATABASE);
                    var rest = [];
                    dbo.collection(process.env.MG_COLLECTION).find({'call.startTime': {$gte: '2018-05-01 '+ str_hour + ':00:00', $lte: '2018-05-01 '+ str_hour +':59:59' }, 'call.endTime' : {$gte: '2018-05-01 ' + str_hour +':00:00', $lte: '2018-05-01 ' + str_hour +':59:59'}})
                        .toArray(function(err, result) {
                            if (err) {
                                console.log(err);
                            } else if (result.length > 0) {
                                rest.push(result);
                                db.close();
                                resolve(rest);
                            } else {
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
    // Parsing hour value
    var str_hour2 = '';
    if(hour.toString().length == 1){
        str_hour2 = '0' + hour.toString();
    } else {
        str_hour2 = hour.toString();
    }

    // Connecting to API
    var options = {
        url: process.env.API_URL + '?customer=all&endTime=2018-05-01 ' + str_hour2 + ':00:00,2018-05-01 ' + str_hour2 +':59:59&startTime=2018-05-01 ' + str_hour2 + ':00:00,2018-05-01 ' + str_hour2 + ':59:59&output=csv',
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
                resolve([body,data]);
            }
        })
    });
}

function save_api_values(data) {
    return new Promise(function (resolve, reject) {
        try {
            fs.writeFile("csv/api_data.csv", data[0], function(err) {
                if(err) {
                    console.log(err);
                } else {
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
    return new Promise(function (resolve, reject) {
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
        if(data[1] && data[0][0] && data[1].length !== data[0][0].length){
            console.log('Collating sources ...');
            try {
                for (var i=0; i < data[1].length; i++) {
                    var element = data[1][i];
                    var exist = 0;
                    var new_iccid = "";
                    if (element.iccid.indexOf("'") != -1) {
                        new_iccid = element.iccid.replace("'", "");
                    } else {
                        new_iccid = element.iccid;
                    }
                    for (var j=0; j < data[0][0].length; j++) {
                        var file = data[0][0][j];
                        if (file.iccid == new_iccid && file.call.startTime == element['startTime(UTC)'] && file.call.endTime == element['endTime(UTC)']) {
                            exist = 1;
                            break;
                        }
                    }
                    if (exist == 0) {
                        result.push(element);
                    }
                }
                console.log('Retrieved different data');
                resolve(result);
            } catch (e) {
                console.log(e);
            }
        } else {
            resolve(result);
        }
    })
}

function save_final_result(data) {
    return new Promise(function (resolve) {
        try {
            if (data.length > 0) {
                result.push(data);
                resolve(data);
            } else {
                resolve(data);
            }
        } catch (e) {
            console.log(e);
        }
    })
}