(function () {
    "use strict";

    var Cloudant = require('cloudant');

    module.exports = (function () {
       return {
           init: new Cloudant(
               {
                   account: process.env.CLOUDANT_USERNAME || JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.username,
                   password: process.env.CLOUDANT_PASSWORD || JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.password
               },
               function (error) {
                   if(error){
                       console.log("Error connecting to Cloudant: " + error);
                   } else {
                       console.log("Connect to Cloudant");
                   }
               }
           )
       }
    })();

}());