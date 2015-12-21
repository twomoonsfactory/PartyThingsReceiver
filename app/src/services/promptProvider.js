export default ngModule => {
  class promptProvider{
      constructor($log, eventService, gameEvents, gameStates, $http){
        this.$log = $log;
        this.eventService = eventService;
        this.gameEvents = gameEvents;
        this.gameStates = gameStates;
        this.$http = $http;

        this.prompts = [];
        this.currentprompts = [];
        this.selectedPrompts = [];
        this.prompt = "";
        this.votes = [0,0,0];

        this.subscribeToGameEvents();
      }

      subscribeToGameEvents(){
        this.eventService.subscribe(this.gameEvents.welcomeLoaded, this.loadPrompts.bind(this));
        this.eventService.subscribe(this.gameStates.WaitingForReady, this.getPrompts.bind(this));
        this.eventService.subscribe(this.gameStates.RoundEnd, this.getPrompts.bind(this));
      }

      loadPrompts(){
        this.$http.jsonp("http://www.twomoonsfactory.com/resources/jsons/prompts.json?callback=JSON_CALLBACK")
          .success(data => {
            this.prompts = data.prompts;
            this.$log.log("Prompts loaded in...");
          })
          .error(data => {
            this.$log.log("error reading prompts");
          });
      }

      getPrompts(){
        if(this.selectedPrompts.length>=this.prompts.length-2)
          this.selectedPrompts = [];  //if we have gone through enough prompts that we don't have enough to fill out the vote, wipe selected prompts and start fresh
        this.currentprompts = _.sample(_.difference(this.prompts, this.selectedPrompts), 3); //filters out all previously selected prompts
        this.eventService.publish(this.gameEvents.promptsLoaded, this.currentprompts);
      }

      //processes votes received
      promptVote(voteindex){
        this.votes[voteindex]++;
      }

      //votes handled
      tallyVotes(){
        let promptIndex = [];
        for(let i = 0; i < this.votes.length; i++){
          if(this.votes[i]===_.max(this.votes))
            promptIndex.push(i);
        }
        if(promptIndex.length === 1)
          this.prompt = this.currentprompts[promptIndex[0]];
        else if(promptIndex.length ===2)
          this.prompt = this.currentprompts[promptIndex[_.random(1)]];
        else
          this.prompt = this.currentprompts[promptIndex[_.random(2)]];
        this.selectedPrompts.push(this.prompt);
      }
    }
  promptProvider.$inject = ['$log', 'eventService', 'gameEvents', 'gameStates', '$http'];
  ngModule.service('promptProvider', promptProvider);
}
