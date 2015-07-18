module.exports = function(eventService, response, gameStates, playerHandler, responseProvider, $log){
      var self = this;
      self.responses = [];
      self.responseList = []; //list sent to users
      self.responseCounter = 1;
      self.shuffled = false;
      this.newResponse = function(args){
        self.responses[self.responseCounter] = new response(args.response, self.responseCounter, args.playerId);
        self.responseCounter++;
      }

      //returns list of responses to send to players
      this.getResponses = function(){
        if(!self.shuffled){
          _.each(self.responses, function(currentresponse){
            self.responseList.push({response:currentresponse.response, responseId:currentresponse.responseId});
          });
          self.responseList = _.shuffle(self.responseList);
          self.shuffled = true;
        }
        return self.responseList;
      }

      //getter for playerId of the writer of a particular response
      this.getWriter = function(args){
        return self.responses[args].playerId;
      }

      //adds correct guess
      this.goodGuess = function(args){
        self.responses[args.responseId].addGoodGuess(args.guesser);
      }

      //adds incorrect guess
      this.badGuess = function(args){
        self.responses[args.responseId].addWrongGuess(args.guesser,args.playerId);
      }

      //resolves correct and incorrect guessers, called by resolveGuesses
      this.resolveResponses = function(){
        var correctlyGuessedResponses = [];
        var incorrectlyGuessedResponses = [];
        _.each(self.responses, function(response){
          if(response.incorrect.length>0){
            //adds to incorrect guess array
            incorrectlyGuessedResponses.push(response)
          }

          //assigns points
          if(response.correct.length>0){
            //adds to correct guess array
            correctlyGuessedResponses.push(response);
          }
        });
        //remove guessedresponses from the array
        _.each(correctlyGuessedResponses, function(guessedResponse){
          self.responses.splice(_.findIndex(self.responses, {responseId: guessedResponse.responseId}), 1);
        });
      }

      //starts fresh at the beginning of the game, or at the start of a new round
      this.freshResponses = function(){
        self.responses = [];
        self.responseCounter = 0;
        self.newResponse({response: responseProvider.getRandomResponse(), playerId: -1});
        self.shuffled = false;
      }
      eventService.subscribe(gameStates.RoundEnd, this.freshResponses);
      eventService.subscribe(gameStates.PromptChosen, this.freshResponses);
    };
