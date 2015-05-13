// ---SPECS-------------------------
'use strict';

//mocking my new setup

describe('gameDriver service', function(){
    var gameDriver, eventService, messageSender, stateManager, playerHandler, thingHandler, log;

    //mock the application before testing
    beforeEach(angular.mock.module('gameMaster'));

    beforeEach(function() {
      module(function($provide) {
        $provide.constant('cast', (function(){

            var castmock = {};

            castmock.testCore = {
                receivedStrings: []
            };

            castmock.receiverManager = {                
                getCastMessageBus: function(string){
                    castmock.testCore.receivedStrings.push(string);
                    return {
                        getNamespace: function(){
                            return 'aNamespace';
                        }
                    }
                },
                start: function(status){
                            castmock.testCore.startStatus = status;
                }
            };

            castmock.receiver = {                
                logger: {
                    setLevelValue: function(levelValue){
                        castmock.testCore.levelValue = levelValue;
                    }
                },
                CastReceiverManager: {
                    getInstance: function(){
                        return castmock.receiverManager;
                    },

                }
            };
            return castmock;
        }()));
      });
     
      inject(function($window) {
        window = $window;
      });
    });

    beforeEach(angular.mock.inject(function (_gameDriver_){
        gameDriver = _gameDriver_;
        //creating an empty scope
        scope = $rootScope.$new();

        //log, imageProvider, messageSender, 
        //messageReceiver, eventService, stateManager,
        //promtProvider;
        log = $injector.get('$log');
        messageSender = $injector.get('messageSender');
        eventService = $injector.get('eventService');
        stateManager = $injector.get('stateManager');
        playerHandler = $injector.get('playerHandler');
        thingHandler = $injector.get('thingHandler');
        
        spyOn(eventService, 'subscribe').and.callThrough();
        spyOn(eventService, 'publish').and.callThrough();

    }));

    it("should send ready requests to the correct players", function(){
        //arrange

        
        //act

        
        //assert

    })
})

// //mocking the main controller of the app for testing
// describe('gameController', function () {
//     var scope, controller, window, log, imageProvider, messageSender, messageReceiver, eventService, stateManager, promptProvider;
    
    // //mock the application before testing
    // beforeEach(angular.mock.module('gameMaster'));

    // beforeEach(function() {
    //   module(function($provide) {
    //     $provide.constant('cast', (function(){

    //         var castmock = {};

    //         castmock.testCore = {
    //             receivedStrings: []
    //         };

    //         castmock.receiverManager = {                
    //             getCastMessageBus: function(string){
    //                 castmock.testCore.receivedStrings.push(string);
    //                 return {
    //                     getNamespace: function(){
    //                         return 'aNamespace';
    //                     }
    //                 }
    //             },
    //             start: function(status){
    //                         castmock.testCore.startStatus = status;
    //             }
    //         };

    //         castmock.receiver = {                
    //             logger: {
    //                 setLevelValue: function(levelValue){
    //                     castmock.testCore.levelValue = levelValue;
    //                 }
    //             },
    //             CastReceiverManager: {
    //                 getInstance: function(){
    //                     return castmock.receiverManager;
    //                 },

    //             }
    //         };
                // I know the logic comes first.  you're getting really choppy.  Now that I'm understanding.... I assumed to early.  Now you are really choppy again.  Take control
                // Now you can type to me -- not right now
                // You're ok, I hear you better right now.

                // no. yes. I know right?  Ye.s

                // Now that you understand unit tests and how they wor, and are getting into mroe elegant ways to manage your code and you can see how concerns are separated.
                // It's a good time to practice TDD (Test Driven Development).
                // Stop writting code and start thinking unit tests.
                // Try to come up with a list of all the things you think shoudl be tested.  Just write it in english, but you're also okay to define object structure.

                //Sample:
                //It should correcly handle guesses:
                    //Dependencies: Array of guesses, array of Things, array of players
                    //Guesses: {guesserId, thingId, suspectId}
                    //Thigns: {thingId, ownerId}
                    //Players: Maybe not needed...
                    //Given 10 players and 10 guesses, if 2 guesses match I should have two matches
                    //It also should mark the guessed player as guessed
                    //It also should award points to the guesser correctly
                        //But points should be separate so we can display them all fancy first before we add them

                //Something like that.  You'll see that this is a serious though exercise and can be tiring,
                //But you will also see that once you do it you'll be able to write the code VERY fast.

                //Because I've already done all of the background thinking, I'm just implementing the minimum to fulfill the test.  Which I've
                //already established is all that I need for my app, yeah? BINGO.  I will try to do the same and we can compare test cases.  From top to bottom?
                //I could end up rewriting the bulk of the app if we do that :)  Not that it's necessarily a bad thing.
                //Proper TDD practices often end up having you scrap what you have and start over.  Why hack frankenstein?  Now you know how to make
                // A pristine being why not just do that?
                //Makes sense.  So, by next week, have those test cases from top to bottom?  Yeah  I can do that. ok  Anything else tonight then? With these beautiful interwebs?no
                //Thanks for all of the help with this -- it's definitely honing my ability... building it lol Sure thing :)  Have a good night. You too





    //         return castmock;
    //     }()));
    //   });
     
    //   inject(function($window) {
    //     window = $window;
    //   });
    // });
//     //set up controller mocking now
//     beforeEach(angular.mock.inject(function($rootScope, $controller, $injector){
            // //creating an empty scope
            // scope = $rootScope.$new();

            // //log, imageProvider, messageSender, 
            // //messageReceiver, eventService, stateManager,
            // //promtProvider;
            // log = $injector.get('$log');
            // imageProvider = $injector.get('imageProvider');
            // messageSender = $injector.get('messageSender');
            // messageReceiver = $injector.get('messageReceiver');
            // eventService = $injector.get('eventService');
            // stateManager = $injector.get('stateManager');
            // promptProvider = $injector.get('promptProvider');
            
            // spyOn(eventService, 'subscribe').and.callThrough();
            // spyOn(eventService, 'publish').and.callThrough();
            // spyOn(messageSender, 'requestGameName').and.callFake(function(gameName){});
            // spyOn(messageSender, 'requestPlayerName').and.callFake(function(playerName){});
            // spyOn(messageSender, 'sendStandby').and.callFake(function(standby){});
            // spyOn(messageSender, 'requestReady').and.callFake(function(ready){});
            // spyOn(messageSender, 'requestPrompt').and.callFake(function(prompt){});
            // spyOn(messageSender, 'requestGuess').and.callFake(function(guess){});

//             //declaring controller with the empty scope
//             controller = $controller('gameController', {$scope: scope});
//     }));
//     // tests start here

//         it('registers playerJoined with eventService', function() {
//             expect(eventService.subscribe).toHaveBeenCalledWith('playerJoined', controller.playerJoinHandler);            
//         });

//          it('handles first playerJoined', function() {
//             spyOn(stateManager, 'setState').and.callThrough();
//             var args = {senderId: 7};
//             var expects = {senderId: 7, message: "Please name your game!"};

//             //act
//             controller.playerJoinHandler(args);

//             expect(stateManager.setState).toHaveBeenCalledWith("waitingForStart");
//             expect(messageSender.requestGameName).toHaveBeenCalledWith(expects);
//          });

//          it('handles second playerJoined', function() {
//             spyOn(stateManager, 'setState').and.callThrough();
//             var args = {senderId: 99};
//             var expects = {senderId: 99, message: "What is your name?"};
//             controller.playerJoinHandler({senderId: 7});

//             //act
//             controller.playerJoinHandler(args);

//             expect(messageSender.requestGameName.calls.count()).toEqual(1);
//             expect(messageSender.requestPlayerName).toHaveBeenCalledWith(expects);
//          });

//          it('names the game and requests playername', function() {
//             //arrange
//             spyOn(controller, 'gamenameReceivedHandler').and.callThrough();
//             var args = {senderId: 99, message: "Foobar"};
//             var expects = {senderId: 99, message: "What is your name?"};

//             //act
//             controller.gamenameReceivedHandler(args);

//             //assert
//             expect(scope.gamename).toEqual(args.message);
//             expect(messageSender.requestPlayerName).toHaveBeenCalledWith(expects);
//          });

//          it('creates a player object successfully', function() {
//             //arrange
//             spyOn(controller, 'playernameReceivedHandler').and.callThrough();
//             var args = {senderId: 99, message: 'JoeBob'}

//             //act

//             controller.playernameReceivedHandler(args);

//             //assert
//             expect(scope.players[0]).toEqual({status: "standingBy",
//                     score: 0,
//                     senderId: 99,
//                     name: 'JoeBob',
//                     guessedThisRound: false,
//                     quit: false,
//                     thingId: null,
//                     playerId: 0
//                 })
//          });

//          it('sets player status for waiting for ready', function(){
//             //arrange
//             spyOn(controller, 'playernameReceivedHandler').and.callThrough();
//             var args = {senderId: 99, message: 'JoeBob'}

//             //act
//             stateManager.setState("waitingForReady");
//             controller.playernameReceivedHandler(args);

//             //assert
//             expect(scope.players[0]).toEqual({status: "notReady",
//                     score: 0,
//                     senderId: 99,
//                     name: 'JoeBob',
//                     guessedThisRound: false,
//                     quit: false,
//                     thingId: null,
//                     playerId: 0
//                 })
//          });

//          it('sets player status for game state "waiting for start"', function(){
//             //arrange
//             spyOn(controller, 'playernameReceivedHandler').and.callThrough();
//             var args = {senderId: 99, message: 'JoeBob'}

//             //act
//             stateManager.setState("waitingForStart");
//             controller.playernameReceivedHandler(args);

//             //assert
//             expect(scope.players[0]).toEqual({status: "notReady",
//                     score: 0,
//                     senderId: 99,
//                     name: 'JoeBob',
//                     guessedThisRound: false,
//                     quit: false,
//                     thingId: null,
//                     playerId: 0
//                 })
//          });

//          it('sends a ready request to the right players on "waitingForReady"', function(){
//             //arrange
//             scope.players[0] = {status: "notReady",
//                     score: 0,
//                     senderId: 99,
//                     name: 'JoeBob',
//                     guessedThisRound: false,
//                     quit: false
//                 };
//             scope.players[1] = {status: "quit",
//                     score: 0,
//                     senderId: 100,
//                     name: 'Sally',
//                     guessedThisRound: false,
//                     quit: true
//                 };
//             //act
//             controller.waitingForReadyHandler();
//             //assert
//             expect(messageSender.requestReady).toHaveBeenCalledWith({senderId:99, message:'Ready Up!'});
//             expect(messageSender.requestReady).not.toHaveBeenCalledWith({senderId:100, message:'Ready Up!'});
//          });

//          it('updates the player state of only the sender on ready received', function(){
//             //arrange
//             scope.players[0] = {status: "notReady",
//                     score: 0,
//                     senderId: 99,
//                     name: 'JoeBob',
//                     guessedThisRound: false,
//                     quit: false,
//                     thingId: null
//                 };
//             scope.players[1] = {status: "quit",
//                     score: 0,
//                     senderId: 100,
//                     name: 'Sally',
//                     guessedThisRound: false,
//                     quit: true,
//                     thingId: null
//                 };
//             var args = {senderId: 99,
//                     message: "Ready"};
//             //act
//             controller.readyReceivedHandler(args);
//             //assert
//             expect(scope.players[0].status).toEqual("ready");
//             expect(scope.players[1].status).not.toEqual("ready");
//          });

//          it('updates the state when all players are ready', function(){
//             //arrange
//             spyOn(stateManager, 'setState').and.callFake(function(state){});
//             scope.players[0] = {status: "notReady",
//                     score: 0,
//                     senderId: 99,
//                     name: 'JoeBob',
//                     guessedThisRound: false,
//                     quit: false,
//                     thingId: null
//                 };
//             scope.players[1] = {status: "quit",
//                     score: 0,
//                     senderId: 100,
//                     name: 'Sally',
//                     guessedThisRound: false,
//                     quit: true,
//                     thingId: null
//                 };
//             stateManager.playerCount = 2;
//             var args = {senderId: 100, message: "Ready"}, args2 = {senderId: 99, message: "Ready"};

//             //act
//             controller.readyReceivedHandler(args);
//             controller.readyReceivedHandler(args2);

//             //assert
//             expect(stateManager.setState).toHaveBeenCalledWith("waitingForVote");
//          });

//         it('brings in players who were "standingBy" and sends all prompt info', function(){
//             //arrange
//             scope.players[0] = {status: "ready",
//                     score: 0,
//                     senderId: 99,
//                     name: 'JoeBob',
//                     guessedThisRound: false,
//                     quit: false
//                 };
//             scope.players[1] = {status: "standingBy",
//                     score: 0,
//                     senderId: 100,
//                     name: 'Sally',
//                     guessedThisRound: false,
//                     quit: true
//                 };

//             //act
//             controller.waitingForVoteHandler();

//             //assert
//             expect(scope.players[0].status).toBe('voting');
//             expect(scope.players[0].status).toBe('voting');
//             expect(scope.prompts).not.toBe(null);
//             expect(messageSender.requestPrompt.calls.count()).toEqual(2);
//         });

//         it('tracks votes accurately', function(){
//             //arrange
//             scope.prompts = promptProvider.getPrompts();
//             scope.players[0] = {status: "voting",
//                     score: 0,
//                     senderId: 99,
//                     name: 'JoeBob',
//                     guessedThisRound: false,
//                     quit: false
//                 };
//             scope.players[1] = {status: "voting",
//                     score: 0,
//                     senderId: 100,
//                     name: 'Sally',
//                     guessedThisRound: false,
//                     quit: false
//                 };
//             scope.players[2] = {status: "voting",
//                     score: 0,
//                     senderId: 5123,
//                     name: 'Kronk',
//                     guessedThisRound: false,
//                     quit: false
//                 };
//             stateManager.playerCount = 3;

//             var vote1 = {senderId: 99, message: "prompt1"};
//             var vote2 = {senderId: 100, message: "prompt1"};
//             var vote3 = {senderId: 5123, message: "prompt3"};

//             //act
//             controller.voteReceivedHandler(vote1);
//             controller.voteReceivedHandler(vote2);
//             controller.voteReceivedHandler(vote3);

//             //assert
//             expect(scope.prompts.vote1).toEqual(2);
//             expect(scope.prompts.vote2).toEqual(0);
//             expect(scope.prompts.vote3).toEqual(1);
//             // expect(scope.thing).toEqual(scope.prompts.prompt1);
//         });

//         it('randomizes tied votes', function(){
//             //arrange
//             scope.prompts = promptProvider.getPrompts();
//             scope.players[0] = {senderId: 99};
//             scope.players[1] = {senderId: 100};
//             scope.players[2] = {senderId: 5123};
//             stateManager.playerCount = 3;

//             var vote1 = {senderId: 99, message: "prompt1"};
//             var vote2 = {senderId: 100, message: "prompt2"};
//             var vote3 = {senderId: 5123, message: "prompt3"};

//             spyOn(Math, 'random').and.callThrough();

//             //act
//             controller.voteReceivedHandler(vote1);
//             controller.voteReceivedHandler(vote2);
//             controller.voteReceivedHandler(vote3);

//             //assert
//             expect(Math.random).toHaveBeenCalled();
//         });
 
//         it('sends the prompt for a submission to the correct players', function(){
//             scope.players[0] = {status: "waiting",
//                     score: 0,
//                     senderId: 99,
//                     name: 'JoeBob',
//                     guessedThisRound: false,
//                     quit: false
//                 };
//             scope.players[1] = {status: "quit",
//                     score: 0,
//                     senderId: 100,
//                     name: 'Sally',
//                     guessedThisRound: true,
//                     quit: false
//                 };
//             scope.players[2] = {status: "waiting",
//                     score: 0,
//                     senderId: 5123,
//                     name: 'Kronk',
//                     guessedThisRound: false,
//                     quit: false
//                 };
//             spyOn(messageSender, 'requestThing').and.callFake(function(thing){});

//             controller.waitingForThingHandler();
 
//             expect(scope.players[1].status).toBe('quit');
//             expect(scope.players[2].status).toBe('writing');
//             expect(messageSender.requestThing.calls.count()).toEqual(2);
//         });

//         it('saves things correctly', function(){
//             scope.players[0] = {status: "writing",
//                     score: 0,
//                     senderId: 99,
//                     name: 'JoeBob',
//                     guessedThisRound: false,
//                     quit: false
//                 };
//             scope.players[1] = {status: "quit",
//                     score: 0,
//                     senderId: 100,
//                     name: 'Sally',
//                     guessedThisRound: true,
//                     quit: false
//                 };
//             scope.players[2] = {status: "writing",
//                     score: 0,
//                     senderId: 5123,
//                     name: 'Kronk',
//                     guessedThisRound: false,
//                     quit: false
//                 };
//             var thing1 = {senderId: 99, message: "thing1"};
//             var thing2 = {senderId: 5123, message: "thing2"};
//             stateManager.playerCount = 2;
            
//             controller.thingReceivedHandler(thing1);
//             controller.thingReceivedHandler(thing2);

//             expect(scope.things[0].randomPosition).toBeLessThan(scope.things[1].randomPosition);
//             expect(scope.players[0].playername).toBe(scope.things[0].playername||scope.things[1].playername);
//         });

//         it('sends the things out as it should', function(){
//             scope.players[0] = {status: "waiting",
//                     score: 0,
//                     senderId: 99,
//                     name: 'JoeBob',
//                     guessedThisRound: false,
//                     quit: false
//                 };
//             scope.players[1] = {status: "quit",
//                     score: 0,
//                     senderId: 100,
//                     name: 'Sally',
//                     guessedThisRound: true,
//                     quit: false
//                 };
//             scope.players[2] = {status: "waiting",
//                     score: 0,
//                     senderId: 5123,
//                     name: 'Kronk',
//                     guessedThisRound: false,
//                     quit: false
//                 };
//             scope.things = {thing: 'something', writer: 'someone', guessedThisTurn: null, guesser: [], turnsUnguessed: 0, randomPosition: 1};

//             controller.waitingForGuessesHandler();

//             expect(messageSender.requestGuess).toHaveBeenCalledWith({senderId: scope.players[0].senderId, message: scope.things});
//             expect(messageSender.requestGuess.calls.count()).toEqual(2);
//         });
      
//         describe('guess Handler', function ()
//         {
//             var players = [{status: "voting",
//                             score: 0,
//                             senderId: 99,
//                             name: 'JoeBob',
//                             guessedThisRound: false,
//                             quit: false
//                         },
//                         {status: "voting",
//                             score: 0,
//                             senderId: 100,
//                             name: 'Sally',
//                             guessedThisRound: false,
//                             quit: false
//                         },
//                          {status: "quit",
//                             score: 0,
//                             senderId: 5123,
//                             name: 'Kronk',
//                             guessedThisRound: false,
//                             quit: false
//                         }];

//             beforeEach(function(){
//                 scope.players = players;
//             });
//                 // it('processes guesses correctly', function(){
//                 //     //NOTE: I would change things to generate an Id when they're received (a simple int counter is fine)
//                 //     // And store that as the id, and then change things to be a hash.
//                 //     // so scope.things = {};
//                 //     // then you can do the dynamic id lookup:  scope.things[guess.thingId];
//                 //     scope.things[0] = {writer: "Sally", thing:"thing1", guessedThisTurn: false, guesser: [], turnsUnguessed: 0, randomPosition: 1};
//                 //     scope.things[1] = {writer: "JoeBob", thing:"thing2", guessedThisTurn: false, guesser: [], turnsUnguessed: 0, randomPosition: 2};
//                 //     stateManager.playerCount = 2;                    
//                 //     var guess1 = {senderId: 99, message: {thing: "thing1", writer: "Sally"}};
//                 //     var guess2 = {senderId: 100, message: {thing: "thing1", writer: "JoeBob"}};
//                 //     stateManager.currentguesses = [];
//                 //     stateManager.currentguesses.push(guess1);
//                 //     stateManager.currentguesses.push(guess2);

//                 //     controller.processGuesses();                    

//                 //     expect(scope.things[0].guessedThisTurn).toBe(true);
//                 //     expect(scope.things[1].guessedThisTurn).toBe(false);
//                 //     expect(scope.wrongGuesses).toBeDefined;
//                 //     expect(scope.wrongGuesses[0]).toBe({thing:'thing1', writer:'JoeBob', guesser: ['JoeBob']});
//                 //     expect(stateManager.state).toBe("roundResults");
//                 // });

//                 // it('doesnt process guesses until all received', function(){
//                 //     scope.things[0] = {writer: "Sally", thing:"thing1", guessedThisTurn: false, guesser: [], turnsUnguessed: 0, randomPosition: 1};
//                 //     scope.things[1] = {writer: "JoeBob", thing:"thing2", guessedThisTurn: false, guesser: [], turnsUnguessed: 0, randomPosition: 2};
//                 //     stateManager.playerCount = 2;
//                 //     var guess1 = {senderId: 99, message: JSON.stringify({thing: "thing1", writer: "Sally"})};
//                 //     var guess2 = {senderId: 100, message: JSON.stringify({thing: "thing1", writer: "JoeBob"})};

//                 //     spyOn(controller, 'processGuesses').and.callFake();


//                 //     controller.guessReceivedHandler(guess1);

//                 //     expect(controller.processGuesses).not.toHaveBeenCalled();
//                 // });

//                 // it('processes guesses after all received', function(){
//                 //     scope.things[0] = {writer: "Sally", thing:"thing1", guessedThisTurn: false, guesser: [], turnsUnguessed: 0, randomPosition: 1};
//                 //     scope.things[1] = {writer: "JoeBob", thing:"thing2", guessedThisTurn: false, guesser: [], turnsUnguessed: 0, randomPosition: 2};
//                 //     stateManager.playerCount = 2;
//                 //     var guess1 = {senderId: 99, message: JSON.stringify({thing: "thing1", writer: "Sally"})};
//                 //     var guess2 = {senderId: 100, message: JSON.stringify({thing: "thing1", writer: "JoeBob"})};

//                 //     spyOn(controller, 'processGuesses').and.callFake(function(){});

//                 //     controller.guessReceivedHandler(guess1);
//                 //     controller.guessReceivedHandler(guess2);

//                 //     expect(controller.processGuesses).toHaveBeenCalled();
//                 // });

//             //     it('stores guesses', function(){
//             //         scope.things[0] = {writer: "Sally", thing:"thing1", guessedThisTurn: false, guesser: [], turnsUnguessed: 0, randomPosition: 1};                    
//             //         stateManager.playerCount = 2;
//             //         var guess1 = {senderId: 99, message: JSON.stringify({thing: "thing1", writer: "Sally"})};                   
//             //         spyOn(controller, 'processGuesses').and.callFake(function(){});

//             //         controller.guessReceivedHandler(guess1);

//             //         expect(stateManager.currentguesses[0]).toBe(guess1);
//             //     });

//             //      it('cleans up after processing ', function(){
//             //         scope.things[0] = {writer: "Sally", thing:"thing1", guessedThisTurn: false, guesser: [], turnsUnguessed: 0, randomPosition: 1};                    
//             //         stateManager.playerCount = 2;
//             //         var guess1 = {senderId: 99, message: JSON.stringify({thing: "thing1", writer: "Sally"})};                   
//             //         spyOn(controller, 'processGuesses').and.callFake(function(){});
//             //         spyOn(controller, 'cleanout').and.callFake(function(){});

//             //         controller.guessReceivedHandler(guess1);
//             //         controller.guessReceivedHandler(guess1);

//             //         expect(controller.cleanout).toHaveBeenCalled();
//             //     });
//             });
// });