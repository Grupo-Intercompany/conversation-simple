(function () {
   "use strict";
   
   module.exports = function (Cloudant, database) {
       return {
           getAllDocs: function () {
               return new Promise(function (resolve, reject) {
                   let params = {
                       include_docs: true
                   };

                   Cloudant.db.use(database).list(params, function (error, body) {
                       if (error) {
                           console.log(error);
                           reject(error);
                       } else {
                           resolve(body.rows);
                       }
                   });
               });
           },
           insertDoc: function (doc) {
               return new Promise(function (resolve, reject) {
                  let params = {};
                  console.log("Log do Doc no insertDoc: ", doc);

                  for (let prop in doc){
                      params[prop] = doc[prop];
                  }

                  console.log("Params: ", params);

                  Cloudant.db.use(database).insert(params, function (error, body) {
                      if (error) {
                          console.log(error);
                          reject(error);
                      } else {
                          resolve(body);
                      }
                  })

               });
           }
       }
   }
   
}());