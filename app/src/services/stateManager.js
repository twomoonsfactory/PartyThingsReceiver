export default ngModule => {
  class stateManager{
    constructor(eventService, gameStates, gameEvents, messageProvider, messageNames, promptProvider, $log){
        this.eventService = eventService;
        this.gameStates = gameStates;
        this.gameEvents = gameEvents;
        this.messageProvider = messageProvider;
        this.messageNames = messageNames;
        this.promptProvider = promptProvider;
        this.$log = $log;

        this.gameName = 'Party Things';
        this.ownerName = null;
        this.state = null;
        this.banner = '';
        this.message = '';
        this.winners = [];
        this.score = 0;
        this.subscribeToGameEvents();
    }

    subscribeToGameEvents(){
      this.eventService.subscribe(this.gameEvents.messageLoaded, this.initialize.bind(this));
      this.eventService.subscribe(this.gameEvents.gameNamed, this.nameGame.bind(this));
      this.eventService.subscribe(this.gameEvents.guessesSorted, this.guessMessageUpdate.bind(this));
      this.eventService.subscribe(this.gameEvents.winnersDecided, this.getWinnerInfo.bind(this));
    }

    initialize(){
      this.setState(this.gameStates.WaitingForFirstPlayer);
    }

    //sets the state and publishes the change.
    setState(newState){
      if(this.state===newState){
        this.$log.log("Already in : " + newState);
      }
      else if(_.contains(this.gameStates, newState)){
        this.state = newState;
        this.$log.log("New gamestate entered: " + this.state);
        this.eventService.publish(this.state, this.state);
        this.updateMessages();
      }
      else{
      	this.$log.log("Attempted to enter invalid gamestate: " + newState);
      }
    }

    //resets the state to a current state (resends messages, loops guess round)
    resetState(sameState){
      if(this.state===sameState){
        this.$log.log("Gamestate looped as: " + this.state);
        this.eventService.publish(this.state, this.state);
        this.updateMessages();
      }
      else
        this.$log.log("In state: " + this.state + " cannot reset: " + sameState);
    }

    checkState(stateToCheck){
      return this.state === stateToCheck;
    }

    nameGame(args){
      this.gameName = args.gameName;
      this.ownerName = args.ownerName + "'s";
      this.updateMessages();
    }

    updateMessages(){
      switch(this.state){
        case this.gameStates.WaitingForFirstPlayer :
          this.message = !this.ownerName ? this.messageProvider.getMessage({messageName: this.messageNames.screenInitialize}) : this.messageProvider.getMessage({messageName: this.messageNames.screenWelcome, pname: this.ownerName});
          break;
        case this.gameStates.WaitingForReady :
          this.message = this.messageProvider.getMessage({messageName:this.messageNames.screenReady});
          break;
        case this.gameStates.ReadyToStart :
          this.message = this.messageProvider.getMessage({messageName:this.messageNames.screenRequestPrompt});
          this.banner = this.messageProvider.getMessage({messageName:this.messageNames.bannerRequestPrompt});
          break;
        case this.gameStates.PromptChosen:
          this.message = this.messageProvider.getMessage({messageName:this.messageNames.screenRequestResponse});
          this.banner = this.messageProvider.getMessage({messageName:this.messageNames.bannerRequestResponse});
          break;
        case this.gameStates.ResponsesReceived:
          this.message = this.messageProvider.getMessage({messageName:this.messageNames.screenRequestGuess, prompt: this.promptProvider.prompt});
          this.banner = this.messageProvider.getMessage({messageName:this.messageNames.bannerRequestGuess});
          break;
        case this.gameStates.RoundEnd:
          this.message = this.messageProvider.getMessage({messageName:this.messageNames.screenRoundResults});
          this.banner = this.messageProvider.getMessage({messageName:this.messageNames.bannerRoundResults});
          break;
        case this.gameStates.GameEnd:
          if(this.winners.length===1){
            this.message = this.messageProvider.getMessage({messageName:this.messageNames.screenGameResultsOneWinner, pname: this.winners[0]});
            this.banner = this.messageProvider.getMessage({messageName:this.messageNames.bannerGameResultsOneWinner, points: this.score});
          }
          else{
            let winnersText = "";
            for(let i=0; i<this.winners.length; i++){
              if(i===0) winnersText += this.winners[i];
              else if(i===this.winners.length-1) winnersText += " & " + this.winners[i];
              else winnersText += ", " + this.winners[i];
            }
            this.message = this.messageProvider.getMessage({messageName:this.messageNames.screenGameResultsMultipleWinners, pname: winnersText});
            this.banner = this.messageProvider.getMessage({messageName:this.messageNames.bannerGameResultsMultipleWinners, points: this.score});
          }
          break;
        default:
      }
      this.eventService.publish(this.gameEvents.messagesUpdated, {message:this.message, banner:this.banner});
    }

    guessMessageUpdate(){
      this.message = this.messageProvider.getMessage({messageName:this.messageNames.screenRoundResults, prompt: this.promptProvider.prompt});
      this.banner = this.messageProvider.getMessage({messageName:this.messageNames.bannerRoundResults});
      this.eventService.publish(this.gameEvents.messagesUpdated, {message:this.message, banner:this.banner});
    }

    endRoundMessageUpdate(winners){
      this.message = this.messageProvider.getMessage({messageName: winners ? this.messageNames.gameOver : this.messageNames.anotherRound});
      this.banner = this.messageProvider.getMessage({messageName:this.messageNames.allGuessed});
      this.eventService.publish(this.gameEvents.messagesUpdated, {message:this.message, banner:this.banner});
    }

    getWinnerInfo(args){
      this.winners = args.winners;
      this.score = args.score;
    }
  }
  stateManager.$inject = ['eventService', 'gameStates', 'gameEvents', 'messageProvider', 'messageNames', 'promptProvider', '$log'];
  ngModule.service('stateManager', stateManager);
}
