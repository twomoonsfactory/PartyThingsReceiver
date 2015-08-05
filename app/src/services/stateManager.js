module.exports = function(eventService, gameStates, gameEvents, messageProvider, messageNames, promptProvider, $log){
      var self = this;
      self.gameName = "Party Things";
    	self.ownerName = null;
      self.state = null;          //the current state of the game
      self.banner = "";           //banner message for the screen
      self.message = "";          //message around the state of the game
      self.winners = [];
      self.score = 0;

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

      //resets the state to a current state (resends messages, loops guess round)
      this.resetState = function(sameState){
        if(self.state===sameState){
          $log.log("Gamestate looped as: " + self.state);
          eventService.publish(self.state, self.state);
          self.updateMessages();
        }
        else
          $log.log("In state: " + self.state + " cannot reset: " + sameState);
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
              self.message = messageProvider.getMessage({messageName:messageNames.screenRequestGuess, prompt: promptProvider.prompt});
              self.banner = messageProvider.getMessage({messageName:messageNames.bannerRequestGuess});
              break;
            case gameStates.RoundEnd:
              self.message = messageProvider.getMessage({messageName:messageNames.screenRoundResults});
              self.banner = messageProvider.getMessage({messageName:messageNames.bannerRoundResults});
              break;
            case gameStates.GameEnd:
              self.message = messageProvider.getMessage({messageName:messageNames.screenGameResults});
              self.banner = messageProvider.getMessage({messageName:messageNames.bannerGameResults, points: self.score});
              break;
            default:
          }
          eventService.publish(gameEvents.messagesUpdated, {message:self.message, banner:self.banner});
      }

      this.guessMessageUpdate = function(){
        self.message = messageProvider.getMessage({messageName:messageNames.screenRoundResults, prompt: promptProvider.prompt});
        self.banner = messageProvider.getMessage({messageName:messageNames.bannerRoundResults});
        eventService.publish(gameEvents.messagesUpdated, {message:self.message, banner:self.banner});
      }
      eventService.subscribe(gameEvents.guessesSorted, this.guessMessageUpdate);

      this.getWinnerInfo = function(args){
        self.winners = args.winners;
        self.score = args.score;
      }
      eventService.subscribe(gameEvents.winnersDecided, this.getWinnerInfo);
    };
