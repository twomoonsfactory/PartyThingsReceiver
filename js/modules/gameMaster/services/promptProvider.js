angular.module('gameMaster')
    .service('promptProvider', ['$log', 'eventService', 'gameStates', function($log, eventService, gameStates){
      //stores prompt list locally, will send three at random on call
      var self = this;
      self.prompts = [];
      self.currentprompts = [];
      self.prompt = "";
      self.votes = [0,0,0];
      $http.get("../resources/prompts.json")
        .success(function(data){
          self.prompts = data.prompts;
          $log.log("Prompts loaded in...");
        })
        .error(function(data){
          $log.log("error reading prompts");
        });

      this.getPrompts = function(){
         self.currentprompts = _.sample(self.prompts, 3);
      }
      eventService.subscribe(gameStates.WaitingForReady, this.getPrompts);
      eventService.subscribe(gameStates.RoundEnd, this.getPrompts);

      //processes votes received
      this.promptVote = function(voteindex){
        var self = this;
        self.votes[voteindex]++;
      }

      //votes handled
      this.tallyVotes = function(){
        var promptindex = _.filter(this.votes, function(num){ return num === _.max(this.votes)})
        if(promptindex.length === 1)
          this.prompt = _.indexOf(this.votes, _.max(this.votes));
        else if(promptindex.lengh ===2){
          if(_.random(0,1)!==0)
            this.prompt = _.lastIndexOf(this.votes, _.max(this.votes));
          else
            this.prompt = _.indexOf(this.votes, _.max(this.votes));
        }
        else
          this.prompt = _.random(0,2);
      }
    }]);