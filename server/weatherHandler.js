(function () {
    "use strict";

    let weather_host = process.env.WEATHER_URL;
    let request = require('request');

    function weatherAPI(path, qs, done) {
        let url = weather_host + path;
        console.log(url, qs);

        request(
            {
                url: url,
                method: "GET",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Accept": "application/json"
                },
                qs: qs
            }, function (error, req, data) {
                if (error) {
                    done(error);
                } else {
                    if (req.statusCode >= 200 && req.statusCode < 400){
                        try {
                            done(null, JSON.parse(data));
                        } catch (e) {
                            console.log(e);
                            done(e);
                        }
                    } else {
                        console.log(error);
                        done({message: req.statusCode, data: data});
                    }
                }
            }
        );
    }

    module.exports = {
        "weatherAPI" : weatherAPI
    }

}());