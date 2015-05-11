angular.module('gamemaster')
    //manages the state of the game
    .service('stateManager', ['eventService', 'gameStates', '$log', function(eventService, gameStates, $log){
      var self = this;
      self.gameName = "";         //holds game name
      self.state = null;          //the current state of the game
      
      //sets the state and publishes the change.
      this.setState = function(newState){

        if(self.state!==newState&&_.contains(gameStates, newState)){
          self.state = newState;
          $log.log("New gamestate entered: " + self.state);
          eventService.publish(self.state, self.state);
        }
        else if(self.state===newState){
        	$log.log("Already in : " + newState);
        }
        else{
        	$log.log("Attempted to enter invalid gamestate: " + newState);
        }
      };

      this.checkState = function(stateToCheck){
        return self.state === stateToCheck;
      }
    }]);