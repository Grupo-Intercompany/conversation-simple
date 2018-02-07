(function () {
  "use strict";

  function generateUniqueId( ) {

    let time = require('time');
    let now = new time.Date();
    let SHA256 = require('crypto-js/sha256');
    let date = SHA256([now.toDateString(), now.toTimeString()].join(" "));

    return date.words[0].toString().replace('-', '');
  }

  module.exports = {
    "generateUniqueId" : generateUniqueId
  }

}());