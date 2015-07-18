module.exports = function($log, $http, eventService, gameEvents){
        var self = this;
        self.responses = [];
        this.loadResponses = function(){
          $http.get("../src/resources/responses.json")
            .success(function(data){
              self.responses = data.responses;
              $log.log("Responses loaded in...");
            })
            .error(function(data){
              $log.log("error reading responses");
            });
        }
        eventService.subscribe(gameEvents.welcomeLoaded, this.loadResponses)

        this.getRandomResponse = function(){
          var randomResponse = _.sample(self.responses);
          return randomResponse;
        }
      };
