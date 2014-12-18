/**
 * Created by rob on 14-12-18.
 */
var q = require('q');
//update all users with new arrival and departure times
exports.calcArrivals = function(cb) {
  return Person.find({})
    .then(function(people) {
      //todo loop through all people and run both arrival and departure calculations and update the people
      var promises = [];
      var calcArrival = function(person) {
        var day = new Date(Date.now()).getDay();
        var deferred = q.defer();
        Arrivals.find({
          person_id: person.id,
          day: day
        }, function(err, arrivals) {
          if((err)) {
            console.log(err);
            deferred.reject(500);
          } else if (!(arrivals)) {
            deferred.resolve(400);
          } else {
            var totalTime = 0;
            for(var i = 0; i<arrivals.length; i++) {
              totalTime = totalTime + parseInt(arrivals[i].time)
            }
            var averageArrival = totalTime/arrivals.length;
            Person.update({
              id:person.id
            }, {
              arrival_time: averageArrival
            }, function(err, person) {
              if((err)) {
                console.log(err);
                deferred.resolve(500);
              } else if (!(person)) {
                console.log('Something went wrong finding a person.');
                deferred.resolve(400)
              } else {
                deferred.resolve(200);
              }
            });
          }
          return deferred.promise;
        });
      };


      for(var i = 0; i < people.length; i++) {
        promises.push(calcArrival(people[i]));
      }

      return q.allSettled(promises)
        .then(function(results) {
          return cb(null, results);
        });
    })
    .catch(function(err) {
      console.log(err);
      return cb(500, null);
    })
}