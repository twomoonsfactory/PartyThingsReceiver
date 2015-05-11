angular.module('gameMaster')
      //provides random "thing" for the computer player
      .service('responseProvider', ['$log', function($log){
        var self = this;
        self.things = [];
        $http.get("../resources/responses.json")
          .success(function(data){
            self.responses = data.responses;
            $log.log("Responses loaded in...");
          })
          .error(function(data){
            $log.log("error reading prompts");
          });

        this.getResponse = function(){
          return _.sample(self.responses, 1);
        }
      }]);
