module.exports = function(eventService, gameStates, gameEvents, messageProvider, messageNames, $log){
      var self = this;
      self.gameName = "Party Things";
    	self.ownerName = null;
      self.state = null;          //the current state of the game
      self.banner = "";           //banner message for the screen
      self.message = "";          //message around the state of the game

      this.initialize = function(){
        self.setState(gameStates.WaitingForStart);
      }
      eventService.subscribe(gameEvents.messageLoaded, this.initialize);

      //sets the state and publishes the change.
      this.setState = function(newState){
        if(self.state===newState){
          $log.log("Already in : " + newState);
        }
        else if(_.contains(gameStates, newState)){
          self.state = newState;
          $log.log("New gamestate entered: " + self.state);
          eventService.publish(self.state, self.state);
          self.updateMessages();
        }
        else{
        	$log.log("Attempted to enter invalid gamestate: " + newState);
        }
      }

      this.checkState = function(stateToCheck){
        return self.state === stateToCheck;
      }

      this.nameGame = function(args){
        self.gameName = args.gameName;
        self.ownerName = args.ownerName + "'s";
        self.updateMessages();
      }
      eventService.subscribe(gameEvents.gameNamed, this.nameGame);

      this.updateMessages = function(){
          switch(self.state){
            case gameStates.WaitingForStart :
              self.message = !self.ownerName ? messageProvider.getMessage({messageName: messageNames.screenInitialize}) : messageProvider.getMessage({messageName: messageNames.screenWelcome, pname: self.ownerName});
              break;
            case gameStates.WaitingForReady :
              self.message = messageProvider.getMessage({messageName:messageNames.screenReady});
              break;
            case gameStates.ReadyToStart :
              self.message = messageProvider.getMessage({messageName:messageNames.screenRequestPrompt});
              self.banner = messageProvider.getMessage({messageName:messageNames.bannerRequestPrompt});
              break;
            case gameStates.PromptChosen:
              self.message = messageProvider.getMessage({messageName:messageNames.screenRequestResponse});
              self.banner = messageProvider.getMessage({messageName:messageNames.bannerRequestResponse});
              break;
            case gameStates.ResponsesReceived:
              self.message = messageProvider.getMessage({messageName:messageNames.screenRequestGuess});
              self.banner = messageProvider.getMessage({messageName:messageNames.bannerRequestGuess});
              break;
            case gameStates.RoundEnd:
              self.message = messageProvider.getMessage({messageName:messageNames.screenRoundResults});
              self.banner = messageProvider.getMessage({messageName:messageNames.bannerRoundResults});
              break;
            case gameStates.gameEnd:
              self.message = messageProvider.getMessage({messageName:messageNames.screenGameResults});
              self.banner = messageProvider.getMessage({messageName:messageNames.bannerGameResults});
              break;
            default:
          }
          eventService.publish(gameEvents.messagesUpdated, {message:self.message, banner:self.banner});
      }
    };
