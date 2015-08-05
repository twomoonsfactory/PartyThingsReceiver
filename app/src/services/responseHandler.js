module.exports = function(eventService, response, gameEvents, gameStates, playerHandler, responseProvider, $log){
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
          self.responseList = [];
          _.each(self.responses, function(currentresponse){
            self.responseList.push({response: currentresponse.response, responseId: currentresponse.responseId});
          });
          self.responseList = _.shuffle(self.responseList);
          self.shuffled = true;
        }
        return self.responseList;
      }

      //getter for playerId of the writer of a particular response
      this.getWriter = function(args){
        return _.findWhere(self.responses, {responseId: args}).playerId;
      }

      //adds correct guess
      this.goodGuess = function(args){
        _.findWhere(self.responses, {responseId: args.responseId}).addGoodGuess(args.guesser);
      }

      //adds incorrect guess
      this.badGuess = function(args){
        _.findWhere(self.responses, {responseId: args.responseId}).addWrongGuess(args.guesser,args.guessedWriter);
      }

      //resolves correct and incorrect guessers, called by resolveGuesses
      this.resolveResponses = function(){
        var correctlyGuessedResponses = [];
        var incorrectlyGuessedResponses = [];
        var toRemove = [];
        _.each(self.responses, function(response){
          if(response.incorrect.length>0){
            //adds to incorrect guess array
            incorrectlyGuessedResponses.push(response);
          }

          //assigns points
          if(response.correct.length>0){
            //adds to correct guess array
            correctlyGuessedResponses.push(response);
            toRemove.push(_.where(self.responses, {responseId: response.responseId})[0]);
          }
        });
        this.sortResponses({right: correctlyGuessedResponses, wrong: incorrectlyGuessedResponses});
        //remove guessedresponses from the array
        self.responses = _.difference(self.responses, toRemove);
        _.each(self.responses, function(response){
          response.wipeGuesses();
        });
      }

      //gathers in the guessed responses by whether they were guessed correctly or not and gathers all information needed for display and scoring before publishing them
      this.sortResponses = function(args){
        var right = args.right;
        var wrong = args.wrong;
        var correct = [];
        var incorrect = [];
        _.each(right, function(goodGuess){
          correct.push({response: goodGuess.response, writer: playerHandler.players[goodGuess.playerId].playerName, writerId:goodGuess.playerId, guessers: []});
          _.each(goodGuess.correct, function(rightGuesser){
            _.last(correct).guessers.push({guesser: playerHandler.players[rightGuesser].playerName, guesserId: rightGuesser});
          });
        });
        _.each(wrong, function(badGuess){
          incorrect.push({response: badGuess.response, guessers: []});
          _.each(badGuess.incorrect, function(wrongGuess){
            _.last(incorrect).guessers.push({guesser: playerHandler.players[wrongGuess.guesser].playerName, guesserId: wrongGuess.guesser, guessedWriter: playerHandler.players[wrongGuess.guessedWriter].playerName, guessedWriterId: wrongGuess.guessedWriter});
          });
        });
        _.each(self.responses, function(response){
          response.wipeGuesses();
        });
        self.shuffled = false;
        eventService.publish(gameEvents.guessesSorted, {guessedRight: correct, guessedWrong: incorrect});
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
