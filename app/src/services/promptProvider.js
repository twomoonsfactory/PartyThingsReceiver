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
        this.$http.get("https://drive.google.com/open?id=0B_DuTdjS_hLtdE9SRWR2eTNWSmc")
          .success(data => {
            this.prompts = data.prompts;
            this.$log.log("Prompts loaded in...");
          })
          .error(data => {
            this.$log.log("error reading prompts");
          });
      }

      getPrompts(){
         this.currentprompts = _.sample(this.prompts, 3);
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
      }
    }
  promptProvider.$inject = ['$log', 'eventService', 'gameEvents', 'gameStates', '$http'];
  ngModule.service('promptProvider', promptProvider);
}
