angular.module('gameMaster', ['gameMaster.controllers', 'gameMaster.services', 'gameMaster.castServices']);
//all display changes still need to be written in -- all internal except the basic test at the moment.
angular.module('gameMaster.controllers', [])
	.controller('gameController', ['$scope', '$log', 'imageProvider', 'messageSender', 'messageReceiver', 'eventService', 'stateManager', 'promptProvider',
		function($scope, $log, imageProvider, messageSender, messageReceiver, eventService, stateManager, promptProvider) {
	     
	      	$scope.message = 'Waiting for Marco';
	      	$scope.hulk = imageProvider.getPic('waiting');
	      	$scope.gamename = null;
	      	$scope.players = [];
	      	$scope.things = [];
	      	$scope.wrongGuesses = [];
	      	$scope.prompts;
	      	$scope.thing;
	      	var wrongCount = 0;
	      	var unguessedCount = 0;
	      	var currentPlayer = 0;
	      	var playerMin = 5;
	      	var gameNameRequested = false;

	      	//player join handler
	      	this.playerJoinHandler = function(args){
	      		if(!gameNameRequested){
	       			stateManager.setState("waitingForStart");
	      			messageSender.requestGameName({senderId:args.senderId, message: "Please name your game!"});
	      			gameNameRequested = true;
	      		}
	      		else{
	      			messageSender.requestPlayerName({senderId:args.senderId, message: "What is your name?"});
	      		}
	      	}
	      	eventService.subscribe("playerJoined", this.playerJoinHandler);

	      	//game name received handler
	      	this.gamenameReceivedHandler = function(args){
	      		$scope.gamename = args.message;
	      		messageSender.requestPlayerName({senderId:args.senderId, message: "What is your name?"});
	      	}	      	
	      	eventService.subscribe("gamenameReceived", this.gamenameReceivedHandler);

	      	//player name received handler
	      	this.playernameReceivedHandler =  function(args){
	      		$scope.players[stateManager.playerCount] = {status: "notReady",
	      			score: 0,
	      			senderId: args.senderId,
	      			name: args.message,
	      			guessedThisRound: false,
	      			quit: false
	      		};
	      		//if the game is already in progress, will have the player wait for the next game
	      		if(stateManager.state!=="waitingForReady"&&stateManager.state!=="waitingForStart"){
	      			messageSender.sendStandby({senderId:args.senderId, message: "Waiting for the next round."});
	      			$scope.players[stateManager.playerCount].status = "standingBy";
	      		}
	      		else if(stateManager.playerCount===playerMin-1) {
	      			stateManager.setState("waitingForReady");
	      		}
	      		stateManager.playerCount++;
	      	};
	      	eventService.subscribe("playernameReceived", this.playernameReceivedHandler);
	      	
			//request ready when waitingForReady state is reached
			this.waitingForReadyHandler = function(){
	      		for(var i = 0; i < $scope.players.length; i++){
	      			if($scope.players[i].status!=="quit"){
	      				messageSender.requestReady({senderId:$scope.players[i].senderId, message:"Ready Up!"});
	      			}
	      		}
	      	};
	      	eventService.subscribe("waitingForReady", this.waitingForReadyHandler);

	      	//tallies ready players and moves state when all elegible players are ready
	      	this.readyReceivedHandler = function(args){
	      		for(var i = 0; i < $scope.players.length; i++){
	      			if($scope.players[i].senderId===args.senderId && args.message==="Ready"){;
	      				$scope.players[i].status="ready";
	      				stateManager.stateCount++;
	      			}
	      			if(stateManager.stateCount===stateManager.playerCount){
	      				stateManager.setState("waitingForVote")
	      				stateManager.stateCount=0;
	      			}
	      		}
	      	};
	      	eventService.subscribe("readyReceived", this.readyReceivedHandler);

	      	//sends prompts to be voted on
	      	this.waitingForVoteHandler = function(){
	      		//var prompts = getPrompts();
	      		for(var i = 0; i < $scope.players.length; i++){
	      			$scope.prompts = promptProvider.getPrompts();
	      			if($scope.players[i].status==="ready"||$scope.players[i].status==="standingBy"){
	      				//brings in any players who have been standing in for round end
	      				if($scope.players[i].status==="standingBy")
	      					stateManager.playerCount++;
	      				messageSender.requestPrompt($scope.players[i].senderId, JSON.stringify($scope.prompts));
	      				$scope.players[i].status="voting";
	      			}
	      		}
	      	};
	      	eventService.subscribe("waitingForVote", this.waitingForVoteHandler);
	      	
	      	//tallies votes on prompts and triggers state change when all votes received
	      	this.voteReceivedHandler = function(args){
	      		for(var i = 0; i < $scope.players.length; i++){
	      			if($scope.players[i].senderId===args.senderId){
	      				$scope.players[i].status="waiting";
	      				switch(args.message){
	      					case "prompt1":
	      						$scope.prompts.vote1++;
	      						break;
      						case "prompt2":
      							$scope.prompts.vote2++;
  								break;;
							default:
								$scope.prompts.vote3++;
						}
	      				stateManager.stateCount++
	      			}
	      		}
	      		if(stateManager.stateCount===stateManager.playerCount){
	      			stateManager.setState("waitingForThing");
	      			stateManager.stateCount=0;
	      			if($scope.prompts.vote1>$scope.prompts.vote2 && $scope.prompts.vote1>$scope.prompts.vote3){
	      				$scope.thing = $scope.prompts.prompt1;
	      			}
	      			else if($scope.prompts.vote2>$scope.prompts.vote1 && $scope.prompts.vote2>$scope.prompts.vote3){
	      				$scope.thing = $scope.prompgs.prompt2;
	      			}
	      			else if($scope.prompts.vote3>$scope.prompts.vote1 && $scope.prompts.vote3>$scope.prompts.vote2){
	      				$scope.thing = $scope.prompts.prompt3;
	      			}
	      			else if($scope.prompts.vote1!==$scope.prompts.vote2 && $scope.prompts.vote1===$scope.prompts.vote3){
	      				if(Math.random()<0.5){
	      					$scope.thing = $scope.prompts.prompt1;
	      				}
	      				else{
	      					$scope.thing = $scope.prompts.prompt3;
	      				}
	      			}
	      			else if($scope.prompts.vote1!==$scope.prompts.vote3 && $scope.prompts.vote1===$scope.prompts.vote2){
	      				if(Math.random()<0.5){
	      					$scope.thing = $scope.prompts.prompt1;
	      				}
	      				else{
	      					$scope.thing = $scope.prompts.prompt2;
	      				}
	      			}
	      			else if($scope.prompts.vote1!==$scope.prompts.vote2 && $scope.prompts.vote2===$scope.prompts.vote3){
	      				if(Math.random()<0.5){
	      					$scope.thing = $scope.prompts.prompt2;
	      				}
	      				else{
	      					$scope.thing = $scope.prompts.prompt3;
	      				}
	      			}
	      			else{
	      				switch(Math.floor(Math.random()*3) + 1){
	      					case 1:
	      						$scope.thing = $scope.prompts.prompt1;
	      						break;
      						case 2:
      							$scope.thing = $scope.prompts.prompt2;
      							break;
  							default:
  								$scope.thing = $scope.prompts.prompt3;
	      				}
	      			}
	      			stateManager.stateCount = 0;
	      			unguessedCount = stateManager.playerCount;
	      		}
	      	};
	      	eventService.subscribe("voteReceived", this.voteReceivedHandler);

	      	//sends request for response to prompt
	      	this.waitingForThingHandler = function(){
	      		for(var i = 0; i < $scope.players.length; i++){
	      			if($scope.players[i].status==="waiting"){
	      				messageSender.requestThing({senderId:$scope.players[i].senderdisconnected, message:$scope.thing});
	      				$scope.players[i].status="writing";
	      			}
	      		}
	      	};
	      	eventService.subscribe("waitingForThing", this.waitingForThingHandler);

			//handles prompt responses, haha
			this.thingReceivedHandler = function(args){
				for(var i = 0; i < $scope.players.length; i++){
					if($scope.players[i].senderId===args.senderId){
						$scope.things.push({writer:$scope.players[i].name,thing:args.message, guessedThisTurn: false, guesser: [], turnsUnguessed: 0, randomPosition: 0});
						$scope.players[i].status="waiting";
						stateManager.stateCount++;
					}
				}
				if(stateManager.stateCount===stateManager.playerCount){
					//shuffle things
					var thingHolder;
					for(var i = 0; i < $scope.things.length; i++){
						$scope.things[i].randomPosition = Math.random();
					}
					for(var i = 0; i < $scope.things.length; i++){
						for(var j = i; j > 0; j--){
							if($scope.things[j].randomPosition < $scope.things[j-1].randomPosition){
								thingHolder = $scope.things[j];
								$scope.things[j] = $scope.things[j-1];
								$scope.things[j-1] = thingHolder;
							}
						}
					}
					stateManager.setState("waitingForGuesses");
					stateManager.stateCount=0;
					wrongCount = 0;
				}
			};
			eventService.subscribe("thingReceived", this.thingReceivedHandler);

			//requests the player's guess
			this.waitingForGuessesHandler =  function(){
				for(var i = 0; i < $scope.players.length; i++){
					if($scope.players[i].status==="waiting"){
						messageSender.requestGuess({senderId: $scope.players[i].senderId, message: JSON.stringify($scope.things)});
						$scope.players[i].status = "guessing";
					}
				}
			};
			eventService.subscribe("waitingForGuesses", this.waitingForGuessesHandler);
			
			//handles received guesses
			this.guessReceivedHandler = function(args){
				

					//NOTE: fromJson should be handled before this point. That a service level responsibility.
					//I'm even okay with it being down where the cast gets the message, it isnt' really logic, just transform

					//NOTE 2: You're doing this for every player when you only get args once, if we left it it should go outside the loop
					var guess = angular.fromJson(args.message);

					var guessingPlayer = _.findWhere($scope.players, {senderId: args.senderId});
					if(!guessingPlayer){
						console.log("unfound player: " + args.senderId);
						return;
					}
									
					guessingPlayer.status="waiting";
					if(!stateManager.currentguesses){
						stateManager.currentguesses = [];
					}

					stateManager.currentguesses.push({player: guessingPlayer, guess:guess});
			
				if(stateManager.currentguesses.length===stateManager.playerCount){
					this.processGuesses();

					this.cleanout();

					stateManager.setState("roundResults");
				}
			}
			eventService.subscribe("guessReceived", this.guessReceivedHandler);

			this.processGuesses = function(){
				//evaluates guesses and sorts them into things for correct guesses and wrongGuesses if not.				
				
			};

			//resolves guesses w/displays and scores
			eventService.subscribe("roundResults", function(args){
				for(var i = 0; i < $scope.things.length; i++){
					var crCounter = 0;
					if($scope.things[i].guessedThisTurn!==false){
						if($scope.things[i].guessedThisTurn){
							$scope.things[i].guessedThisTurn = false;
							for(var j =0; j < $scope.players.length; j++){
								if($scope.thing[i].writer===$scope.players[j].playername){
									$scope.players[j].guessedThisRound=true;
									unguessedCount--;
								}
							}
							$scope.currentResults[crCounter]={thing:$scope.things[i].thing,
														guessed:$scope.things[i].guessedThisTurn,
														guesses:[]};
							for(var j = 0; j < $scope.things[i].guesser.length; j++){
								$scope.currentResults[crCounter].guesses.push({guesser:$scope.things[i].guesser[j],
																			writer:$scope.things[i].writer,
																			correct:true});
							}
						}
						else{
							$scope.things[i].turnsUnguessed++;
							$scope.currentResults[crCounter]={thing:$scope.things[i].thing,
																guessed:false,
																guesses:[]};
							//assigns bonus points for another round unguessed
							for(var j = 0; j < $scope.players.length; j++){
								if($scope.thing[i].writer===$scope.player[j].playername){
									$scope.player[j].score += 3;
								}
							}

						}
						for(var j = 0; j < $wrongGuesses.length; j++){
								if(wrongGuesses[j].thing===$scope.things[i].thing){
									for(var k = 0; k < $wrongGuesses[j].guesser.length; k++){
										$scope.currentResults[crCounter].guesses.push({guesser:wrongGuesses[j].guesser[k],
																					writer:wrongGuesses[j].writer,
																					correct:false});
									}
								}
							}
						crCounter++;
					}	
				}
				//display results and assign points for votes, point handler will send score updates to individual players
				//if point handling results in player exceeding point threshold
				//stateManager.setState("endGame");
				//else
				this.cleanout();
				stateManager.setState("waitingForVote");
			});
			
			//handles end game
			eventService.subscribe("endGame", function(args){
				for(var i = 0; i < $scope.players.length; i++){
					if($scope.players[i].status==="waiting"){
						messageSender.sendEnd($scope.players[i].senderId, "You had " + $scope.players[i].score + " points!");
						/*scoreHandler.winner + " won the game with " + scoreHandler.highscore + " points!\n*/
					}
				}
				stateManager.setState("waitingForReady");
			});

			//handles player quit
			this.playerQuit = function(args){
				for(var i = 0; i < $scope.players.length; i++){
					if(args.senderId===$scope.players[i].senderId){
						$scope.players[i].quit=true;
						//change the player's display
						switch(stateManater.state){
							case "waitingForStart" || "waitingForReady":
								$log.log("Player " + $scope.players[i].playername + "quit, sender ID " + $scope.players[i].senderId);
								$scope.players = $scope.players.slice(i+1);
								break;
							case "waitingForVote":
								if($scope.players[i].status==="waiting"){
									stateManager.stateCount--;
								}
								$log.log("Player " + $scope.players[i].playername + "quit, sender ID " + $scope.players[i].senderId);
								$scope.players = $scope.players.slice(i+1);
								stateManager.playerCount--;
								break;
							case "waitingForGuesses" || "waitingForThing":
								if($scope.players[i].status!=="waiting"){
									$log.log("Player " + $scope.players[i].playername + "quit, sender ID " + $scope.players[i].senderId);
									$scope.players = $scope.players.slice(i+1);
									stateManager.stateCount--;
									stateManager.playerCount--;
								}				
								else{
									//figure out how to handle this
									$scope.players[i].quit = true;
									$log.log("Player " + $scope.players[i].playername + "quit pended, sender ID " + $scope.players[i].senderId);
								}
								break;
						}
					}
				}
			};
			//removes players who were marked for quit, but were tied into the curernt events
			this.cleanout = function(){
				for(var i = 0; i < $scope.players.length; i++){
					if($scope.players.quit){
						$log.log("Player " + $scope.players[i].playername + "quit, sender ID " + $scope.players[i].senderId);
						$scope.players = $scope.players.slice(i+1);
					}
				}
			};
			eventService.subscribe("playerQuit", this.playerQuit);


  	}]);

angular.module('gameMaster.services', [])
//provides the requested image as a return
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
  		this.state = null;
  		this.stateCount = 0;
  		this.playerCount = 0;
  		this.setState = function(newState){
  			if(this.state!==newState){
  				this.state = newState;
  				$log.log("New gamestate entered: " + this.state);
  				eventService.publish(this.state, this.state);
  			}
  		};
  	})
  	//provides prompts for the game
  	.service('promptProvider', function($log){
  		this.getPrompts = function(request){
  			//in here have logic for ajax call for prompt retrieval from DB
  			return {vote1: 0, vote2: 0, vote3: 0, 
  				prompt1: 'prompt1', prompt2: 'prompt2', prompt3: 'prompt3'};
  		}
  	});
angular.module('gameMaster.castServices', [])
	.constant('cast', window.cast)
  	.factory('castMessageBus', function(cast, messagetypes, eventService, $log) {

	    // start up chromecast
	    cast.receiver.logger.setLevelValue(0);
	    var castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
	    $log.log('Starting Receiver Manager');

	    // 'ready' event handler
	    castReceiverManager.onReady = function(event) {
	      $log.log('Received Ready event: ' + JSON.stringify(event.data));
	      castReceiverManager.setApplicationState("Application status is ready...");
	    };

	    // 'senderconnected' event handler
	    castReceiverManager.onSenderConnected = function(event) {
	      $log.log('Received Sender Connected event: ' + event.data);
	      $log.log(castReceiverManager.getSender(event.data).userAgent);
	      eventService.publish('playerJoined', {senderId: event.senderId, message: event.data});
	    };

	    // 'senderdisconnected' event handler
	    castReceiverManager.onSenderDisconncted = function(event) {
	      $log.log('Received Sender Disconnected event: ' + event.data);
	      if (event.reason === cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER){
	      	eventService.publish('playerQuit', {senderId: event.senderId, message: event.data});
	      }
	      if (castReceiverManager.getSenders().length === 0) {
	        close();
	      }
	    };

	    // 'systemvolumechanged' event handler
	    castReceiverManager.onSystemVolumeChanged = function(event) {
	      $log.log('Received System Volume Changed event: ' + event.data.level + ' ' + event.data.muted);
	    };

	    //initializing channel collection
	    var messageBuses = [];

	  	for(var i = 0; i < messagetypes.length; i++){
	  		messageBuses[messagetypes[i]] = castReceiverManager.getCastMessageBus('urn:x-cast:com.partythings.' + messagetypes[i]);
	  		$log.log(messageBuses[messagetypes[i]].getNamespace());
	  	}    


	    // initialization for the manager and log
	    castReceiverManager.start({statusText: "Application is starting"});
	    $log.log('Receiver Manager started');

	    return messageBuses;
 	})
	.service('messageSender', function(castMessageBus, $log){

		//request gamename from player
		this.requestGameName = function(event) {
			castMessageBus.gamename.send(event.senderId, event.message);
		};

		//request playername from player
		this.requestPlayerName = function(event) {
			castMessageBus.playername.send(event.senderId, event.message);
		};

		//reqest ready from player
		this.requestReady = function(event) {
			castMessageBus.ready.send(event.senderId, event.message);
		};

		//request prompt from player
		this.requestPrompt = function(event) {
			castMessageBus.prompt.send(event.senderId, event.message);
		};

		//send standby to player
		this.sendStandby = function(event) {
			castMessageBus.standby.send(event.senderId, event.message);
		}

		//request thing from player
		this.requestThing = function(event) {
			castMessageBus.thing.send(event.senderId, event.message);
		};

		//request guess from player
		this.requestGuess = function(event) {
			castMessageBus.guess.send(event.senderId, event.message);
		};

		//send result to player
		this.sendResult = function(event) {
			castMessageBus.result.send(event.senderId, event.message);
		};

		//send end to player
		this.sendEnd = function(event) {
			castMessageBus.end.send(event.senderId, event.message);
		};

		//send quit confirmation to player
		this.sendQuit = function(event) {
			castMessageBus.quit.send(event.senderId, event.message);
		};
	})
	.service('messageReceiver', function(castMessageBus, eventService, $log){
		
		//gamename received
		castMessageBus.gamename.onMessage = function(event){
			eventService.publish("gamenameReceived", {senderId: event.senderId, message: event.data});
		};
		//playername received
		castMessageBus.playername.onMessage = function(event){
			eventService.publish("playernameReceived", {senderId: event.senderId, message: event.data});
		};
		//ready response received
		castMessageBus.ready.onMessage = function(event){
			eventService.publish("readyReceived", {senderId: event.senderId, message: event.data});
		};
		//prompt received
		castMessageBus.prompt.onMessage = function(event){
			eventService.publish("voteReceived", {senderId: event.senderId, message: event.data});
		};
		//thing received
		castMessageBus.thing.onMessage = function(event){
			eventService.publish("thingReceived", {senderId: event.senderId, message: event.data});
		};
		//guess received
		castMessageBus.guess.onMessage = function(event){
			eventService.publish("guessReceived", {senderId: event.senderId, message: event.data});
		};
		//end received
		castMessageBus.end.onMessage = function(event){
			eventService.publish("endReceived", {senderId: event.senderId, message: event.data});
		};
		//quit received
		castMessageBus.quit.onMessage = function(event){
			eventService.publish("quitReceived", {senderId: event.senderId, message: event.data});
		};
	})
	.constant('messagetypes', ['gamename','playername','ready','prompt','standby','thing','guess','result','end', 'quit']);