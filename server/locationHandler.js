(function () {
    "use strict";

    let request = require('request');

    function location (url) {

        return new Promise(function (resolve, reject) {
            request(url, function (error, response, body) {
                if (error){
                    console.log(error);
                    reject(error);
                } else {
                    body = JSON.parse(body);

                    let lat = body.results[0].geometry.location.lat;
                    let lng = body.results[0].geometry.location.lng;

                    let options = {
                        method: 'POST',
                        url: 'http://localhost:3000/api/forecast/daily',
                        // url: '/api/forecast/daily',
                        headers:
                            { 'content-type': 'application/json' },
                        body: { lat: lat, lng: lng },
                        json: true
                    };

                    request(options, function (error, response, body) {
                        if (error) {
                            console.log(error);
                            reject(error);
                        }

                        let temp;
                        let tempo;

                        if (response.body.forecasts[0].day){
                            temp = response.body.forecasts[0].day.temp;
                        } else if (response.body.forecasts[0].night){
                            temp = response.body.forecasts[0].night.temp;
                        }

                        if (temp <= 15){
                            tempo = 'muito frio';
                        } else if (temp <= 20) {
                            tempo = 'frio';
                        } else if (temp <= 25) {
                            tempo = 'bom'
                        } else if (temp <= 30) {
                            tempo = 'calor'
                        } else {
                            tempo = 'muito calor'
                        }

                        resolve ('O tempo por lá está ' + tempo);
                    });
                }
            });
        })
    }

    module.exports = {
        "location" : location
    }

}());