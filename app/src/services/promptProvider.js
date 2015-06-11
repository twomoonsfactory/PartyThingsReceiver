module.exports = function($log, eventService, gameStates, $http){
      //stores prompt list locally, will send three at random on call
      var self = this;
      self.prompts = [];
      self.currentprompts = [];
      self.prompt = "";
      self.votes = [0,0,0];
      this.loadPrompts = function(){
        $http.get("../resources/prompts.json")
          .success(function(data){
            self.prompts = data;
            $log.log("Prompts loaded in...");
          })
          .error(function(data){
            $log.log("error reading prompts");
          });
      }
      eventService.subscribe(gameStates.WaitingForStart, this.loadPrompts);

      this.getPrompts = function(){
         self.currentprompts = _.sample(self.prompts, 3);
      }
      eventService.subscribe(gameStates.WaitingForReady, this.getPrompts);
      eventService.subscribe(gameStates.RoundEnd, this.getPrompts);

      //processes votes received
      this.promptVote = function(voteindex){
        self.votes[voteindex]++;
      }

      //votes handled
      this.tallyVotes = function(){
        var promptIndex = [];
        for(i = 0; i < self.votes.length; i++){
          if(self.votes[i]===_.max(self.votes))
            promptIndex.push(i);
        }
        if(promptIndex.length === 1)
          self.prompt = self.currentprompts[promptIndex[0]];
        else if(promptIndex.length ===2)
          self.prompt = self.currentprompts[promptIndex[_.random(0,1)]];
        else
          this.prompt = self.currentprompts[_.random(0,2)];
      }
    };