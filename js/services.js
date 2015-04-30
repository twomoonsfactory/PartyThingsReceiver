angular.module('gameMaster.services',  [])
    
    //contains the game logic 
    .service('gameDriver', function(eventService, messageSender, stateManager, $log){
       
        //takes over after the minimum number of players have joined and named themselves, requests them to indicate readiness
        //will skip players already sent this message as necessary (players carried over from previous games, etc)
        this.readyUp = function(){
          _.each(playerHandler.players, function(player){
            if(player.state==="standingBy"){
              messageSender({senderId: player.senderId, message: player.playerName + ", thanks for waiting! Are you ready?"});
            }
            else if(player.state!=="quit"&&player.state!=="readyRequested"){
              messageSender({senderId: player.senderId, message: player.playerName + ", are you ready to play?"});
              player.state = "readyRequested";
            }
          });
          stateManager.stateCount = 0;
        }
        eventService.subscribe("WaitingForReady", this.readyUp);

        //confirms player ready when received, continues on with the game when all active players have "readied"
        this.playerReady = function(args){
          var readyPlayer = _.filter(playerHandler.players, function(player){return player.senderId === args.senderId});
          readyPlayer.state = "ready";
          stateManager.stateCount++;
          if(stateManager.stateCount < stateManager.activePlayers){
            messageSender({senderId: readyPlayer.senderId, message: "You're ready " + readyPlayer.playerName + ", tell everyone else to get their act together!"});          
          }
          else{
            messageSender({senderId: readyPlayer.senderId, message: "About time " + readyPlayer.playerName + ", the game's about to start!"});
            stateManager.setState("ReadyToStart");
            //sets statecount back to 0
            stateManager.stateCount = 0;
          }
        }
        eventService.subscribe("readyReceived", this.playerReady);

        //sends each player the same three prompts to vote on
        this.sendPrompts = function(){
          _.each(playerHandler.players, function(player){
            if(player.state === "ready"){
              messageSender({senderId: player.senderId, message: {message: "Please select something to write about: ", things: promptProvider.currentprompts}});
              player.state = "voting";
            }
          });
        }
        eventService.subscribe("ReadyToStart", this.sendPrompts);

        //manages incoming votes, assigning them to the right prompt, then calling the prompt provider to return the winning prompt when
        //all votes are received.
        this.voteReceived = function(args){
          var votingPlayer = _.filter(playerHandler.players, function(player){return player.senderId === args.senderId;});
          votingPlayer.state = "ready";
          promptProvider.promptVote(args.message.promptindex);
          messageSender({senderId:votingPlayer.senderId, message:"Thanks " + votingPlayer.playerName + ", you voted for '" + promptProvider.currentprompts[args.message.promptindex] + "', thanks! Now bug everyone else to vote..."});
          stateManager.stateCount++;
          if(stateManager.stateCount===stateManager.activePlayers){
            promptProvider.tallyVotes();
            stateManager.stateCount=0;
            stateManager.setState("PromptChosen");
          }
        }
        eventService.subscribe("voteReceived", this.voteReceived);

        //sends winning prompt to users for their responses
        this.requestThings = function(){
          _.each(playerHandler.players, function(player){
            if(player.state === "ready"){
              messageSender.requestThing({senderId:player.senderId, message:"Your prompt is '" + promptProvider.prompt + "', write about it!"});
              player.state = "writing";
            }
          });
        }
        eventService.subscribe("PromptChosen", this.requestThings);

        //manages incoming things, sending the new thing to the thingHandler, until all players have submitted their "things"
        this.receivedThings = function(args){
          var thingWriter = _.findWhere(playerHandler.players, function(player){return player.senderId === args.senderId;});
          thingHandler.newThing({thing: args.message.thing, playerId:thingWriter.playerId});
          thingWriter.state = "ready";
          messageSender({senderId:thingWriter.senderId, message:"You submitted '" + args.message.thing + "', guessing will start when everyone has submitted."});
          stateManager.stateCount++;
          if(stateManager.stateCount===stateManager.activePlayers){
            stateManager.stateCount=0;
            stateManager.setState("ThingsReceived");
          }
        }
        eventService.subscribe("thingReceived", this.receivedThings);

        //starts the guessing round, sending each active player a list of elegible things and another of elegible players
        this.startGuessing = function(){
          _.each(playerHandler.players, function(player){
            if(player.state === "ready"){
              messageSender.requestGuess({senderId: player.senderId,message:{message: "It's time to make a guess!", things: thingHandler.getThings(), elegiblePlayers: playerHandler.getElegiblePlayers()}});
              player.state = "guessing";
            }
          });
        }
        eventService.subscribe("ThingsReceived", this.startGuessing);

        //handles guesses -- iterates through rounds of guessing until there are no unguessed players or only one unguessed player.
        this.guessReceiver = function(args){
          var guesser = _.filter(playerHandler.players, function(player){return player.senderId === args.senderId; });
          guessHandler.newGuess({guesser: guesser.playerId, data: args.message);
          guesser.state = "ready";
          messageSender.requestGuess({senderId: guesser.senderId, message: "Thanks! You guessed that " + playerHandler.players[args.message.playerId].playerName + " said '" + thingHandler.things[args.message.thingId].thing + "'."});
          stateManager.stateCount++;   
          if(stateManager.stateCount===stateManager.activePlayers){
            stateManager.stateCount = 0;
            guessHandler.tallyGuesses();
            if(playerHandler.unguessedPlayers()){
              if(player.state === "ready"){
               messageSender.requestGuess({senderId: player.senderId,message:{message: "Here is what's left...", things: thingHandler.getThings(), elegiblePlayers: playerHandler.getElegiblePlayers()}});
                player.state = "guessing";
              }
            }
            else   
              stateManager.setState("RoundEnd");
          }
        }
        eventService.subscribe("guessReceived", this.guessReceiver);

        //function to either roll things back to a fresh round with all the active players and players standing by, or
        //sends the game on to end game.
        this.nextRound = function(){
          if(playerHandler.highScore()>=stateManager.winningScore){
            stateManager.setState("GameEnd");
          }
          else{
            _.each(playerHandler.players, function(player){
              if(player.state === "standingBy"){
                messageSender.requestReady({senderId: player.senderId, message: "Thanks for waiting " + player.playerName + ", get ready to go!"});
                player.state = "ready";
                stateManager.activePlayers ++;
              }
            });
            stateManager.setState("readyReceived");
          }
        }
        eventService.subscribe("RoundEnd", this.nextRound);

        //handles the final end game, displaying the winner(s), and asking players if they want to play again
        this.endGame = function(){
          var winners = playerHandler.getWinners();
          //Logic to display winners.
          _.each(this.players, function(player){
            var endMessage = "";
            if(player.state === "ready"){
              if(_.contains(winners, player.playerName)){
                endMessage += "Way to go " + player.playerName + ", you won!  ";
              }
              else
                endMessage+= "I like this game, another?!";
              messageSender.sendEnd({senderId: player.senderId, message: endMessage});
              player.state = "readyRequested";
            }
          }
        stateManager.setState("WaitingForReady");
        //at this point (adjustable since I know we haven't discussed exactly how to handle it) either the player submits "ready" on the readyReceived channel
        //or submits a quit request.
      }
      eventService.subscribe("GameEnd", this.endGame);
    })

    //sub-pub observer service
    .service('eventService', function($log){
      this.subs = {};
      //takes subscriptions, functions to be called on a specific event being published.
      this.subscribe = function(eventId, subscriber){
        if(!this.subs.eventId){
          this.subs[eventId] = [];
        }
        this.subs[eventId].push(subscriber);
      };
      //publishes a specific event, calling the arguments, if any.
      this.publish = function(eventId, args){
        if(!this.subs.eventId){
          $log.log('Invalid eventId published: ' + eventId);
        }
        else{
          for(var i = 0; i > this.subs[eventId].length; i ++){
            this.subs[eventId][i](args);
          }
        }
      }
    })

    //manages the state of the game
    .service('stateManager', function(eventService, $log){
      this.gameName = "";         //holds game name
      this.state = null;          //the current state of the game
      this.stateCount = 0;        //how many players have participated in the current state
      this.activePlayers = 0;     //the number of players currently playing -- should it be moved to the playerHandler?
      this.minimumPlayers = 5;    //the minimum number of players to start the game
      this.winningScore = 50;     //the score that, when reached, ends the game.
      
      //sets the state and publishes the change.
      this.setState = function(newState){
        if(this.state!==newState){
          this.state = newState;
          $log.log("New gamestate entered: " + this.state);
          eventService.publish(this.state, this.state);
        }
      };
    })

    //player handler keeps track of player information
    .service('playerHandler', function(eventService, player, messageSender, stateManager, $log){
      this.players = [];          //contains all players of the game
      this.playerCounter = 0;     //keeps players assigned sequentially
      
      //this is where new players are added to the game
      this.addPlayer = function(args){
        if(stateManager.state === null){
          messageSender.requestGameName({senderId: args.senderId, message: "Welcome to the party.  Please enter your name, and name your game!"});
          stateManager.state = "WaitingForStart";
        }
        else{
          messageSender.requestPlayerName({senderId: args.senderId, message: "Welcome to " + stateManager.gameName + "! Please enter your name!"});
        }
      }
      eventService.subscribe("playerJoined", this.addPlayer);

      //this is where the game is names and the first player is created
      this.gameNamed = function(args){
        stateManager.gameName = args.message.gamename;
        this.playerNamed(args);
      }
      eventService.subscribe("gamenameReceived", this.gameNamed);

      //this is where new players are created and assigned a state appropriate to the game's state, ready requests even being handled.
      //Need error handling for duplicate player names, as it can create confusion
      this.playerNamed = function(args){
        this.players[this.playerCounter]=player.build(args.message.playername, args.senderId);
        if(stateManager.state === "WaitingForStart"){
          messageSender.requestPlayerName(args.senderId, "Hi " + args.message.playername + "! Thanks for joining " + stateManager.gameName + ", we're waiting for the game to start.");
          this.players[this.playerCounter].state = "waiting";
          stateManager.activePlayers++;
        }
        else if(stateManager.state === "WaitingForReady"){
          messageSender.requestReady(args.senderId, args.message.playername + "! We've bee waiting, please ready up!");
          this.players[this.playerCounter].state = "readyRequested";
          stateManager.activePlayers++;
        }
        else{
          messageSender.requestReady(args.senderId, "Hi " + args.message.playername + ", thanks for joining " + stateManager.gameName + ", please wait for the next round.");
          this.players[this.playerCounter].state = "standingBy";
        }
        if(stateManager.activePlayers=>stateManager.minimumPlayers){
          stateManager.setState "WaitingForReady";
        }
        this.players[this.playerCounter].playerId = this.playerCounter;
        this.playerCounter++;
      }
      eventService.subscribe("playernameReceived", this.playerNamed);

      //returns unguessed, still playing players
      this.getElegiblePlayers = function(){
        var elegiblePlayers = [];
        _.each(this.players, function(player){
          if(player.state === "ready" && player.guessed === false){
            elegiblePlayers.push = {playerName: player.playerName, playerId: player.playerId};
          }
        });
        return elegiblePlayers;
      }

      //gives players their points, determined in the thing handler
      this.assignPoints = function(args){
        this.players[args.playerId].score += args.points;
      }
      
      //establishes that the given player has been guessed
      this.playerGuessed = function(args){
        this.players[args.playerId].guessed = true;
      }
      
      //assigns bonus points for being unguessed
      this.playerUnguessed = function(args){
        this.players[args.playerId].score += args.points;
      }
      
      //returns true if there are more than 1 unguessed players
      this.unguessedPlayers = function(){
        var results = _.countBy(this.players, function(player){
          if(player.guessed === true)
            return guessed;
          else
            return unguessed;
        })
        if(results.guessed > 1)
          return true;
        else
          return false;
      }

      //returns the highest score
      this.highScore = function(){
        var highScore = 0;
        _.each(this.players, function(player){
          if(player.score > highScore)
            highScore = player.score;
          return highScore;
        });
      }

      //returns the player names of the winning player(s)
      this.getWinners = function(){
        var winners = _.filter(this.players, function(player){
          if(player.score===this.highScore){
            return player.playerName;
          }
        });
      }

      //at the end of round, sets all players to unguessed
      this.freshRound = function(){
        _.each(this.players, function(player){
            player.guessed = false;
          }
        });
      }
      eventService.subscribe("RoundEnd", this.freshRound);

      //at the end of game, sets all scores to zero, all players to unguessed
      this.freshGame = function(){
        _.each(this.players, function(player){
            player.score = 0;
            player.guessed = false;
          }
        });
      }
      eventService.subscribe("GameEnd", this.freshGame);

      //allows the players to quit at any point without seriously disrupting gameplay.  Will still allow for submitted things to be guessed
      //for points, etc.
      this.playerQuit = function(args){
        var quitter = _.findWhere(playerHandler.players, function(player){return player.senderId === args.senderId;});
        if(quitter.state === "ready")
          stateManager.stateCount--;
        stateManager.activePlayers--;
        //logic to remove quit player from on screen display here
        quitter.state = "quit";
        messageSender({senderId: quitter.senderId, message: "OK, " + quitter.playerName + ", we're sorry to see you go."});
      }
      eventService.subscribe("quitReceived", this.playerQuit);
    })

    //thing handler keeps track of submitted "thing" information and the game's random entry
    .service('thingHandler', function(eventService, $log){
      this.things = [];
      this.thingCounter = 1;
      this.newThing = function(args){
        this.things[this.thingCounter] = {thing: args.thing, thingId: this.thingCounter, playerId: args.playerId, correct: [], incorrect: []};
        this.thingCounter++;
      }
      //returns list of things to send to players
      this.getThings = function(){
        var thinglist = []
        _.each(this.things, function(currentThing){
          thinglist.push({thing:currentThing.thing, thingId:currentThing.thingId});
        });
        thinglist = _.shuffle(thinglist);
        return thinglist;
      }

      //getter for playerId of the writer of a particular thing
      this.getWriter = function(args){
        return this.things[args].playerId;
      }

      //adds correct guess
      this.goodGuess = function(args){
        this.things[args.thingId].correct.push(args.guesser);
      }

      //adds incorrect guess
      this.badGuess = function(args){
        this.things[args.thingId].incorrect.push({guesser:args.guesser,writer:args.playerId});
      }

      //resolves correct and incorrect guessers, called by resolveGuesses
      this.resolveThings = function(){
        var guessedThings = [];
        _.each(this.things, function(thing){
          if(thing.incorrect.length>0){
            //display updates re:incorrect guesses
          }

          //assigns points
          if(thing.correct.length>0){
            _.each(thing.correct, function(scorer){
              //assigns points for correct guess based on the number of players guessing the same
              playerHandler.assignPoints({playerId:scorer, points:Math.floor(10/thing.correct.length)});
              //display updates re:correct guesses
            });
            playerHandler.playerGuessed({playerId:thing.playerId});
            //saved guessed things to drop from the "things" array after iterating through.
            guessedThings.push(_.indexOf(this.things, thing));
          }
          else{
            //assigns bonus points for the player(s) unguessed this round
            playerHandler.assignPoints({playerId:thing.playerId, points: 5});
          }
        });
        if(!playerHandler.unguessedPlayers){
          var unguessed = playerHandler.getElegiblePlayers();
          playerHandler.assignPoints({playerId:unguessed[0].playerId, points:5});
          //display update, bonus points for final unguessed player
          //display something for the computer's thing, thingId -1
        }
        //remove guessedThings from the array
        _.each(guessedThings, function(guessedThing){
          this.things.splice(guessedThing, 1);
        });
      }

      //starts fresh at the beginning of the game, or at the start of a new round
      this.freshThings = function(){
        this.things = []
        this.things[0] = {thing: computerThing.getThing(), thingId: -1, playerId: -1, correct: [], incorrect: []};
        this.thingCounter = 1;
      }
      eventService.subscribe("RoundEnd", this.freshThings);
      eventService.subscribe("ReadyToStart", this.freshThings);
    })

    //hadles the guesses
    .service('guessHandler', function($log){
      this.guesses = [];
      this.newGuess = function(args){
        this.guesses.push({guesser:args.guesser,playerId:args.data.playerId,thingId:args.data.thingId});
      }
      this.tallyGuesses = function(){
        _.each(this.guesses, function(guess){
          if(thingHandler.getWriter(guess.thingId)===guess.playerId){
            thingHandler.goodGuess({thingId:guess.thingId,guesser:guess.guesser});
          }
          else{
            thingHandler.badGuess({thingId:guess.thingId,guesser:guess.guesser,writer:guess.playerId});
          }
        });
        thingHandler.resolveThings();
      }
      this.wipeGuesses = function(){
        this.guesses = [];
      }
      eventService.subscribe("RoundEnd", this.wipeGuesses);
    })
    
    //provides prompts for the game
    .service('promptProvider', function($log){
      //stores prompt list locally, will send three at random on call
      this.prompts = [];
      this.currentprompts = [];
      this.prompt = "";
      this.votes = [0,0,0];
      $http.get("resources/prompts.json")
        .success(function(data){
          this.prompts = data.prompts;
          $log.log("Prompts loaded in...");
        })
        .error(function(data){
          $log.log("error reading prompts");
        });

      this.getPrompts = function(){
         this.currentprompts = _.sample(this.prompts, 3);
      }
      eventService.subscribe("waitingForReady", this.getPrompts);
      eventService.subscribe("RoundEnd", this.getPrompts);

      //processes votes received
      this.promptVote = function(voteindex){
        this.votes[voteindex]++;
      }

      //provides random "thing" for the computer player
      .service('thingProvider', function($log){
        this.things = [];
        $http.get("resources/things.json")
          .success(function(daga){
            this.things = data.things;
            $log.log("Things loaded in...");
          })
          .error(function(data){
            $log.log("error reading prompts");
          });

        this.getThing = function(){
          return _.sample(this.things, 1);
        }
      })

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
    })

    //provides the requested image as a return... this will be expanded as UI decisions are made.
    .service('imageProvider', function() {
      var images = [{
        id: "waiting",
        image: "https://33.media.tumblr.com/48b1991b8026737f52d607651be4a43e/tumblr_nkpb0640Of1qcm3fwo1_500.gif"
      }, {
          id: "done",
          image: "https://31.media.tumblr.com/9609c3e2cd75207185faeff18e44d2ab/tumblr_mthtpofxcy1rdbd0qo2_500.gif"
      }];

      this.getPic = function(arg) {
          for (var i = 0; i < images.length; i++) {
            if (images[i].id === arg)
                return images[i].image;
          }
      };
    });
