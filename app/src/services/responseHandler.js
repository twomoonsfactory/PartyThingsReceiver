module.exports = function(eventService, response, gameStates, playerHandler, responseProvider, $log){
      var self = this;
      self.responses = [];
      self.responseCounter = 1;
      this.newResponse = function(args){
        self.responses[self.responseCounter] = new response(args.response, self.responseCounter, args.playerId);
        self.responseCounter++;
      }
      //returns list of responses to send to players
      this.getResponses = function(){
        var responselist = []
        _.each(self.responses, function(currentresponse){
          responselist.push({response:currentresponse.response, responseId:currentresponse.responseId});
        });
        responselist = _.shuffle(responselist);
        return responselist;
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
        var guessedResponses = [];
        _.each(self.responses, function(response){
          if(response.incorrect.length>0){
            //display updates re:incorrect guesses
          }

          //assigns points
          if(response.correct.length>0){
            _.each(response.correct, function(scorer){
              //assigns points for correct guess based on the number of players guessing the same
              playerHandler.assignPoints({playerId:scorer, points:Math.floor(10/response.correct.length)});
              //display updates re:correct guesses
            });
            playerHandler.playerGuessed({playerId:response.playerId});
            //saved guessed responses to drop from the "responses" array after iterating through.
            guessedResponses.push(response.responseId);
          }
          else{
            //assigns bonus points for the player(s) unguessed this round
            if(response.playerId!==-1)
              playerHandler.assignPoints({playerId:response.playerId, points: 5});
          }
        });
        if(!playerHandler.unguessedPlayers){
          var unguessed = playerHandler.getElegiblePlayers();
          playerHandler.assignPoints({playerId:unguessed[0].playerId, points:5});
          //display update, bonus points for final unguessed player
          //display someresponse for the computer's response, responseId -1
        }
        //remove guessedresponses from the array
        _.each(guessedResponses, function(guessedResponse){
          self.responses.splice(_.findIndex(self.responses, {responseId: guessedResponse}), 1);
        });
      }

      //starts fresh at the beginning of the game, or at the start of a new round
      this.freshResponses = function(){
        self.responses = [];
        self.responses[0] = new response(responseProvider.getResponse(), -1, -1);
        self.responseCounter = 1;
      }
      eventService.subscribe(gameStates.RoundEnd, this.freshResponses);
      eventService.subscribe(gameStates.ReadyToStart, this.freshResponses);
    };