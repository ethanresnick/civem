can.CachedModel = can.Model.extend({
  makeFindAll: function(findAllData) {

    // A place to store requests
    var cachedRequests = {};

    // A simple hash function 
    function makeHash(string) { 
      var hash = 0, i, char;
      if (string.length == 0) return hash;
      for (i = 0, l = string.length; i < l; i++) {
          char  = string.charCodeAt(i);
          hash  = ((hash<<5)-hash)+char;
          hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }

    return function(params, success, error){
      var cacheKey = this.name + makeHash(findAllData.toString()) + JSON.stringify(params);
      console.log(cacheKey);
      if(!cachedRequests[cacheKey]) {
          var self = this;
          // make the request for data, save deferred
          cachedRequests[cacheKey] = findAllData(params).then(function(data){
              // convert the raw data into instances
              return self.models(data)
          })
      }

      // get the saved request
      var def = cachedRequests[cacheKey]
      // hookup success and error
      def.then(success,error)
      return def;
    }  
  }
},{});