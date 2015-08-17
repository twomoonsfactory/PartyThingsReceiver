export default class stateManager{
  constructor(eventService, gameStates, gameEvents, messageProvider, messageNames, promptProvider, $log){
    //local variables
    this.gameName = "Party Things";
  	this.ownerName = null;
    this.state = null;          //the current state of the game
    this.banner = "";           //banner message for the screen
    this.message = "";          //message around the state of the game
    this.winners = [];
    this.score = 0;
    //local references to injected externals
    this.eventService = eventService;
    this.gameStates = gameStates;
    this.gameEvents = gameEvents;
    this.messageProvider = messageProvider;
    this.messageNames = messageNames;
    this.promptProvider = promptProvider;
    this.log = $log;
    //event subscriptions
    this.eventService.subscribe(this.gameEvents.messageLoaded, this.initialize);
    this.eventService.subscribe(this.gameEvents.gameNamed, this.nameGame);
    this.eventService.subscribe(this.gameEvents.guessesSorted, this.guessMessageUpdate);
    this.eventService.subscribe(this.gameEvents.winnersDecided, this.getWinnerInfo);
  }
  initialize(){
    this.setState(this.gameStates.WaitingForStart);
  }

  //sets the state and publishes the change.
  setState(newState){
    if(this.state===newState){
      this.log.log("Already in : " + newState);
    }
    else if(_.contains(this.gameStates, newState)){
      this.state = newState;
      this.log.log("New gamestate entered: " + this.state);
      this.eventService.publish(this.state, this.state);
      this.updateMessages();
    }
    else{
    	this.log.log("Attempted to enter invalid gamestate: " + newState);
    }
  }

  //resets the state to a current state (resends messages, loops guess round)
  resetState(sameState){
    if(this.state===sameState){
      this.log.log("Gamestate looped as: " + this.state);
      this.eventService.publish(this.state, this.state);
      this.updateMessages();
    }
    else
      this.log.log("In state: " + this.state + " cannot reset: " + sameState);
  }

  //simple state compare
  checkState(stateToCheck){
    return this.state === stateToCheck;
  }

  //feeds in game name and owner name
  nameGame(args){
    this.gameName = args.gameName;
    this.ownerName = args.ownerName + "'s";
    this.updateMessages();
  }

  //updates system display messages
  updateMessages(){
      switch(this.state){
        case this.gameStates.WaitingForStart :
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
          this.message = this.messageProvider.getMessage({messageName:this.messageNames.screenGameResults});
          this.banner = this.messageProvider.getMessage({messageName:this.messageNames.bannerGameResults, points: this.score});
          break;
        default:
      }
      this.eventService.publish(this.gameEvents.messagesUpdated, {message:this.message, banner:this.banner});
  }

  //updateds messages within a gess phase
  guessMessageUpdate(){
    this.message = this.messageProvider.getMessage({messageName:this.messageNames.screenRoundResults, prompt: this.promptProvider.prompt});
    this.banner = this.messageProvider.getMessage({messageName:this.messageNames.bannerRoundResults});
    this.eventService.publish(this.gameEvents.messagesUpdated, {message:this.message, banner:this.banner});
  }

  getWinnerInfo(args){
    this.winners = args.winners;
    this.score = args.score;
  }
}
stateManager.$inject = ['eventService', 'gameStates', 'gameEvents', 'messageProvider', 'messageNames', 'promptProvider', '$log'];
