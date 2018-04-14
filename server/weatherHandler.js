(function () {
    "use strict";

    let weather_host = process.env.WEATHER_URL;
    let request = require('request');

    /*
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
                            console.log("weatherHandler");
                            console.log(JSON.parse(data));
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
    */
/*
    function weatherAPI (path){

      let options = {
        method: 'GET',
        url: 'https://weatherapi-ic.mybluemix.net/weather',
        qs:
          { language: 'en-US',
            units: 'm',
            latitude: '-23.610',
            longitude: '-46.63' },
        headers:
          {
            "Content-Type": "application/json;charset=utf-8",
            "Accept": "application/json"
          }
      };

      request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(JSON.parse(body).temperature_phrase);
        return JSON.parse(body).temperature_phrase;
      });


    }
    */
    function weatherAPI (path){
      return new Promise ((resolve, reject) => {
        let options = {
          method: 'GET',
          url: 'https://weatherapi-ic.mybluemix.net/weather',
          qs:
            { language: 'en-US',
              units: 'm',
              latitude: '-23.610',
              longitude: '-46.63' },
          headers:
            {
              "Content-Type": "application/json;charset=utf-8",
              "Accept": "application/json"
            }
        };

        request(options, function (error, response, body) {
          if (error){
            reject(error);
          }

          resolve(JSON.parse(body));
        });
      });
    }

    module.exports = {
        "weatherAPI" : weatherAPI
    }

}());