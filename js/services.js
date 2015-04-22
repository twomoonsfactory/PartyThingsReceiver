angular.module('gameMaster.services',  [])
  	//contains the game logic 
    .service('gameDriver', function(eventService, messageSender, stateManager, $log){
        //takes over after the minimum number of players have joined and named themselves, requests them to indicate readiness
        this.readyUp = function(){
          _.each(playerHandler.players, function(player){
            messageSender({senderId: player.senderId, message: player.playerName + ", are you ready to play?"});
            player.state = "readyRequested";
            stateManager.stateCount = 0;
          });
        }
        eventService.subscribe("WaitingForReady", this.readyUp);

        this.playerReady = function(args){
          var readyPlayer = _.findWhere(playerHandler.players, player.senderId === args.senderId);
          readyPlayer.state = "ready";
          stateManager.stateCount++;
          if(stateManager.stateCount < stateManager.activePlayers){
            messageSender({senderId: readyPlayer.senderId, message: "You're ready " + readyPlayer.playerName + ", tell everyone else to get their act together!"});          
          }
          else{
            messageSender({senderId: readyPlayer.senderId, message: "About time " + readyPlayer.playerName + ", the game's about to start!"});
            stateManager.setState("ReadyToStart");
          }
        }
        eventService.subscribe("readyReceived", this.playerReady);
    })
    //sub-pub service
  	.service('eventService', function($log){
  		this.subs = {};
  		this.subscribe = function(eventId, subscriber){
  			if(!this.subs.eventId){
  				this.subs[eventId] = [];
  			}
  			this.subs[eventId].push(subscriber);
  		};
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
      this.gameName = "";
  		this.state = null;
  		this.stateCount = 0;
  		this.activePlayers = 0;
      this.minimumPlayers = 5;
  		this.currentguesses = null;
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
      this.players = {};
      this.addPlayer = function(args){
        //this is where new players are added tot he game
        if(stateManager.state === null){
          messageSender.requestGameName({senderId: args.senderId, message: "Welcome to the party.  Please enter your name, and name your game!"});
          stateManager.state = "WaitingForStart";
        }
        else{
          messageSender.requestPlayerName({senderId: args.senderId, message: "Welcome to " + stateManager.gameName + "! Please enter your name!"});
        }
      }
      eventService.subscribe("playerJoined", this.addPlayer);

      this.removePlayer = function(args){
        //this is where players are dropped from the game
      }

      this.gameNamed = function(args){
        //this is where the game is names and the first player is created
        stateManager.gameName = args.message.gamename;
        this.playerNamed(args);
      }
      eventService.subscribe("gamenameReceived", this.gameNamed);

      this.playerNamed = function(args){
        //this is where new players are created and assigned a state appropriate to the game's state, ready requests even being handled.
        //Need error handling for duplicate player names
        this.players[args.message.playername]=player.build(args.message.playername, args.senderId);
        if(stateManager.state === "WaitingForStart"){
          messageSender.requestPlayerName(args.senderId, "Hi " + args.message.playername + "! Thanks for joining " + stateManager.gameName + ", we're waiting for the game to start.");
          this.players[args.message.playername].state = "waiting";
          stateManager.activePlayers++;
        }
        else if(stateManager.state === "WaitingForReady"){
          messageSender.requestReady(args.senderId, args.message.playername + "! We've bee waiting, please ready up!");
          this.players[args.message.playername].state = "readyRequested";
          stateManager.activePlayers++;
        }
        else{
          messageSender.requestReady(args.senderId, "Hi " + args.message.playername + ", thanks for joining " + stateManager.gameName + ", please wait for the next round.");
          this.players[args.message.playername].state = "standingBy";
        }
        if(stateManager.activePlayers=>stateManager.minimumPlayers){
          stateManager.setState "WaitingForReady";
        }
      }
      eventService.subscribe("playernameReceived", this.playerNamed);
    })

    //thing handler keeps track of submitted "thing" information
    .service('thingHandler', function(eventService, $log){

    })
  	//provides prompts for the game
  	.service('promptProvider', function($log){
  		this.getPrompts = function(request){
  			//in here have logic for ajax call for prompt retrieval from DB
  			return {vote1: 0, vote2: 0, vote3: 0, 
  				prompt1: 'prompt1', prompt2: 'prompt2', prompt3: 'prompt3'};
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
