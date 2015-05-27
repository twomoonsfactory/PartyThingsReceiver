angular.module('gameMaster')
      //provides random "thing" for the computer player
      .service('responseProvider', ['$log', '$http', 'eventService', 'gameStates', function($log, $http, eventService, gameStates){
        var self = this;
        self.responses = [];
        this.loadResponses = function(){
          $http.get("../resources/responses.json")
            .success(function(data){
              self.responses = data;
              $log.log("Responses loaded in...");
            })
            .error(function(data){
              $log.log("error reading prompts");
            });
        }
        eventService.subscribe(gameStates.WaitingForStart, this.loadResponses)

        this.getResponse = function(){
          return _.sample(self.responses, 1)[0];
        }
      }]);
