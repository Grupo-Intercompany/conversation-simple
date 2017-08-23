(function () {

    "use strict";

    module.exports = (function () {
        return {
            username: process.env.NLU_USERNAME || JSON.parse(process.env.VCAP_SERVICES).natural-language-understanding[0].credentials.username,
            password: process.env.NLU_PASSWORD || JSON.parse(process.env.VCAP_SERVICES).natural-language-understanding[0].credentials.password,
            version_date: "2017-02-27",
            url: "https://gateway.watsonplatform.net/natural-language-understanding/api"
        }
    }());
}());