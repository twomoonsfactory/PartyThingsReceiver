export default ngModule => {
  ngModule.service('promptProvider', ['$log', 'eventService', 'gameEvents', 'gameStates', '$http', ($log, eventService, gameEvents, gameStates, $http) => {
      //stores prompt list locally, will send three at random on call
      let self = this;
      self.prompts = [];
      self.currentprompts = [];
      self.prompt = "";
      self.votes = [];
      this.loadPrompts = ()=>{
        $http.get("../src/resources/prompts.json")
          .success(data => {
            self.prompts = data.prompts;
            $log.log("Prompts loaded in...");
          })
          .error(data => {
            $log.log("error reading prompts");
          });
      }
      eventService.subscribe(gameEvents.welcomeLoaded, this.loadPrompts);

      this.getPrompts = ()=>{
         self.currentprompts = _.sample(self.prompts, 3);
         eventService.publish(gameEvents.promptsLoaded, self.currentprompts);
      }
      eventService.subscribe(gameStates.WaitingForReady, this.getPrompts);
      eventService.subscribe(gameStates.RoundEnd, this.getPrompts);

      //processes votes received
      this.promptVote = voteindex => {
        self.votes[voteindex]++;
      }

      //votes handled
      this.tallyVotes = () => {
        self.votes= [0,0,0];
        let promptIndex = [];
        for(let i = 0; i < self.votes.length; i++){
          if(self.votes[i]===_.max(self.votes))
            promptIndex.push(i);
        }
        if(promptIndex.length === 1)
          self.prompt = self.currentprompts[promptIndex[0]];
        else if(promptIndex.length ===2)
          self.prompt = self.currentprompts[promptIndex[_.sample([promptIndex[0],promptIndex[1]])]];
        else
          self.prompt = self.currentprompts[_.random(0,2)];
      }
    }])
}
