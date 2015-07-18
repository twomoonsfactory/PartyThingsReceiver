module.exports = function(eventService, gameEvents, stateManager, gameStates, messageSender, messageProvider, messageNames, playerHandler, playerStates, responseHandler, promptProvider, guessHandler, $log){
        var self = this;
        self.winningScore = 50;     //the score that, when reached, ends the game.
        //takes over after the minimum number of players have joined and named themselves, requests them to indicate readiness
        //will skip players already sent this message as necessary (players carried over from previous games, etc)
        this.readyUp = function(){
          _.each(playerHandler.players, function(player){
            if(player.state!==playerStates.quit&&player.state!==playerStates.readyRequested){
              messageSender.requestReady({senderId: player.senderId, message: messageProvider.getMessage({messageName: messageNames.readyRequest, pname: player.playerName})});
              player.setState(playerStates.readyRequested);
            }
          });
          playerHandler.resetPlayerActedCount();
        }
        eventService.subscribe(gameStates.WaitingForReady, this.readyUp);

        //confirms player ready when received, continues on with the game when all active players have "readied"
        this.playerReady = function(args){
          var readyPlayer = playerHandler.findPlayer(args.senderId);
          readyPlayer.setState(playerStates.ready);
          playerHandler.playerActed();
          eventService.publish(gameEvents.playerUpdated, "");
          if(playerHandler.actedPlayersCount < playerHandler.activePlayers){
            messageSender.requestReady({senderId: readyPlayer.senderId, message: messageProvider.getMessage({messageName: messageNames.readyConfirm, pname: readyPlayer.playerName})});
          }
          else{
            messageSender.requestReady({senderId: readyPlayer.senderId, message: messageProvider.getMessage({messageName: messageNames.lastReadyConfirm, pname: readyPlayer.playerName})});
            stateManager.setState(gameStates.ReadyToStart);

             //sets statecount back to 0
            playerHandler.resetPlayerActedCount();
          }
        }
        eventService.subscribe(gameEvents.readyReceived, this.playerReady);

        //sends each player the same three prompts to vote on
        this.sendPrompts = function(){
          _.each(playerHandler.players, function(player){
            if(player.checkState(playerStates.ready)){
              messageSender.requestPrompt({senderId: player.senderId, message: {message: messageProvider.getMessage({messageName: messageNames.promptRequest, pname: player.playerName}), prompts: promptProvider.currentprompts}});
              player.setState(playerStates.voting);
            }
          });
        }
        eventService.subscribe(gameStates.ReadyToStart, this.sendPrompts);

        //manages incoming votes, assigning them to the right prompt, then calling the prompt provider to return the winning prompt when
        //all votes are received.
        this.voteReceived = function(args){
          var votingPlayer = playerHandler.findPlayer(args.senderId);
          votingPlayer.setState(playerStates.ready);
          promptProvider.promptVote(args.message.promptIndex);
          messageSender.requestPrompt({senderId:votingPlayer.senderId, message: messageProvider.getMessage({messageName: messageNames.promptConfirm, pname: votingPlayer.playerName, prompt: promptProvider.prompt})});
          playerHandler.playerActed();
          if(playerHandler.actedPlayersCount===playerHandler.activePlayers){
            promptProvider.tallyVotes();
            playerHandler.resetPlayerActedCount();
            stateManager.setState(gameStates.PromptChosen);
          }
        }
        eventService.subscribe(gameEvents.voteReceived, this.voteReceived);

        //sends winning prompt to users for their responses
        this.requestResponse = function(){
          _.each(playerHandler.players, function(player){
            if(player.checkState(playerStates.ready)){
              messageSender.requestResponse({senderId:player.senderId, message: messageProvider.getMessage({messageName: messageNames.responseRequest, prompt: promptProvider.prompt})});
              player.setState(playerStates.writing);
            }
          });
        }
        eventService.subscribe(gameStates.PromptChosen, this.requestResponse);

        //manages incoming things, sending the new thing to the responseHandler, until all players have submitted their "things"
        this.receivedResponse = function(args){
          var responseWriter = playerHandler.findPlayer(args.senderId);
          responseHandler.newResponse({response: args.message.response, playerId:responseWriter.playerId});
          responseWriter.setState(playerStates.ready);
          messageSender.requestResponse({senderId:responseWriter.senderId, message: messageProvider.getMessage({messageName: messageNames.responseConfirm, pname: responseWriter.playerName, resp: args.message.thing})});
          playerHandler.playerActed();
          if(playerHandler.actedPlayersCount===playerHandler.activePlayers){
            playerHandler.resetPlayerActedCount();
            stateManager.setState(gameStates.ResponsesReceived);
          }
        }
        eventService.subscribe(gameEvents.responseReceived, this.receivedResponse);

        //starts the guessing round, sending each active player a list of elegible things and another of elegible players
        this.startGuessing = function(){
          _.each(playerHandler.players, function(player){
            if(player.checkState(playerStates.ready)){
              messageSender.requestGuess({senderId: player.senderId,message:{message: messageProvider.getMessage({messageName:messageNames.guessRequest}), things: responseHandler.getResponses(), elegiblePlayers: playerHandler.getElegiblePlayers()}});
              player.setState(playerStates.guessing);
            }
          });
        }
        eventService.subscribe(gameStates.ResponsesReceived, this.startGuessing);

        //handles guesses -- iterates through rounds of guessing until there are no unguessed players or only one unguessed player.
        this.guessReceiver = function(args){
          var guesser = playerHandler.findPlayer(args.senderId)
          guessHandler.newGuess({guesser: guesser.playerId, playerId: args.message.playerId, responseId: args.message.responseId});
          guesser.setState(playerStates.ready);
          // messageSender.requestGuess({senderId: guesser.senderId, message: messageProvider.getMessage({messageName: messageNames.guessConfirm, pname: playerHandler.players[args.message.playerId].playerName, resp: responseHandler.responses[args.message.responseId].response})});
          playerHandler.actedPlayersCount++;
          if(playerHandler.actedPlayersCount===playerHandler.activePlayers){
            playerHandler.actedPlayersCount = 0;
            guessHandler.tallyGuesses();
          }
        }
        eventService.subscribe(gameEvents.guessReceived, this.guessReceiver);

        //either moves game forward to round resolution or back to guessing if still more than one unguessed player
        this.guessesResolved = function(args){
          if(playerHandler.unguessedPlayers())
            stateManager.setState(gameStates.ResponsesReceived);
          else
            stateManager.setState(gameStates.RoundEnd);
        }
        eventService.subscribe(gameEvents.guessesResolved, this.guessesResolved);

        //function to either roll things back to a fresh round with all the active players and players standing by, or
        //sends the game on to end game.
        this.nextRound = function(){
          var self = this;
          if(playerHandler.highScore()>=self.winningScore){
            stateManager.setState(gameStates.GameEnd);
          }
          else{
            _.each(playerHandler.players, function(player){
              if(player.checkState(playerStates.standingBy)){
                messageSender.requestReady({senderId: player.senderId, message: messageProvider.getMessage({messageName: messageNames.standingByReadyRequest, pname: player.playerName})});
                player.setState(playerStates.ready);
                playerHandler.activePlayers ++;
              }
            });
            stateManager.setState(gameStates.ReadyToStart);
          }
        }
        eventService.subscribe(gameStates.RoundEnd, this.nextRound);

        //handles the final end game, displaying the winner(s), and asking players if they want to play again
        this.endGame = function(){
          var winners = playerHandler.getWinners();
          //Logic to display winners.
          _.each(playerHandler.players, function(player){
            var endMessage = "";
            if(player.checkState(playerStates.ready)){
              if(_.contains(winners, player)){
                endMessage += messageProvider.getMessage({messageName: messageNames.winner, pname: player.playerName, score: playerHandler.highScore()});
              }
              endMessage+= messageProvider.getMessage({messageName: messageNames.endGame});
              messageSender.sendEnd({senderId: player.senderId, message: endMessage});
              player.setState(playerStates.readyRequested);
            }
          stateManager.setState(gameStates.WaitingForReady);
          //at this point (adjustable since I know we haven't discussed exactly how to handle it) either the player submits playerStates.ready on the readyReceived channel
          //or submits a quit request.
          });
        }
        eventService.subscribe(gameStates.GameEnd, this.endGame);
    };
