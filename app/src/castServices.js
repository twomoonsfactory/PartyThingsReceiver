module.exports = angular.module('castServices', [])
  // THIS IS REAL
  .constant('cast', window.cast)
  //THIS IS NOT
    .constant('cast', (()=>{

            let castmock = {};

            castmock.testCore = {
                receivedStrings: []
            };

            castmock.receiverManager = {
                getCastMessageBus: function(string){
                    castmock.testCore.receivedStrings.push(string);
                    return {
                        getNamespace: ()=>{
                            return 'aNamespace';
                        },
                        send: ()=>{

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
                    getInstance: ()=>{
                        return castmock.receiverManager;
                    },

                }
            };
            return castmock;
        }()))

    // Here we ge real again
    .factory('castMessageBus', function(cast, messagetypes, eventService, gameEvents, $log) {

      // start up chromecast uncomment next line for production
      cast.receiver.logger.setLevelValue(0);
      let castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
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
        eventService.publish(gameEvents.playerJoined, {senderId: event.senderId, message: event.data});
      };

      // 'senderdisconnected' event handler
      castReceiverManager.onSenderDisconncted = function(event) {
        $log.log('Received Sender Disconnected event: ' + event.data);
        if (event.reason === cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER){
          eventService.publish(gameEvents.quitReceived, {senderId: event.senderId, message: event.data});
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
      let messageBuses = [];

      for(let i = 0; i < messagetypes.length; i++){
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
      castMessageBus.gamename.send(event.senderId, JSON.stringify({message: event.message}));
    };

    //request playername from player
    this.requestPlayerName = function(event) {
      castMessageBus.playername.send(event.senderId, JSON.stringify({message: event.message}));
    };

    //reqest ready from player
    this.requestReady = function(event) {
      castMessageBus.ready.send(event.senderId, JSON.stringify({message: event.message}));
    };

    //request prompt from player
    this.requestPrompt = function(event) {
      castMessageBus.prompt.send(event.senderId, JSON.stringify({message: event.message}));
    };

    //send standby to player
    this.sendStandby = function(event) {
      castMessageBus.standby.send(event.senderId, JSON.stringify({message: event.message}));
    }

    //request thing from player
    this.requestResponse = function(event) {
      castMessageBus.thing.send(event.senderId, JSON.stringify({message: event.message}));
    };

    //request guess from player
    this.requestGuess = function(event) {
      castMessageBus.guess.send(event.senderId, JSON.stringify({message: event.message}));
    };

    //send result to player
    this.sendResult = function(event) {
      castMessageBus.result.send(event.senderId, JSON.stringify({message: event.message}));
    };

    //send end to player
    this.sendEnd = function(event) {
      castMessageBus.end.send(event.senderId, JSON.stringify({message: event.message}));
    };

    //send quit confirmation to player
    this.sendQuit = function(event) {
      castMessageBus.quit.send(event.senderId, JSON.stringify({message: event.message}));
    };
  })
  .service('messageReceiver', function(castMessageBus, eventService, gameEvents, $log){

    //gamename received
    castMessageBus.gamename.onMessage = function(event){
      eventService.publish(gameEvents.gamenameReceived, {senderId: event.senderId, message: angular.fromJson(event.data)});
    };
    //playername received
    castMessageBus.playername.onMessage = function(event){
      eventService.publish(gameEvents.playernameReceived, {senderId: event.senderId, message: angular.fromJson(event.data)});
    };
    //ready response received
    castMessageBus.ready.onMessage = function(event){
      eventService.publish(gameEvents.readyReceived, {senderId: event.senderId, message: angular.fromJson(event.data)});
    };
    //prompt received
    castMessageBus.prompt.onMessage = function(event){
      eventService.publish(gameEvents.voteReceived, {senderId: event.senderId, message: angular.fromJson(event.data)});
    };
    //thing received
    castMessageBus.thing.onMessage = function(event){
      eventService.publish(gameEvents.responseReceived, {senderId: event.senderId, message: angular.fromJson(event.data)});
    };
    //guess received
    castMessageBus.guess.onMessage = function(event){
      eventService.publish(gameEvents.guessReceived, {senderId: event.senderId, message: angular.fromJson(event.data)});
    };
    //quit received
    castMessageBus.quit.onMessage = function(event){
      eventService.publish(gameEvents.quitReceived, {senderId: event.senderId, message: angular.fromJson(event.data)});
    };
  })
  .constant('messagetypes', ['gamename','playername','ready','prompt','standby','thing','guess','result','quit', 'end']);
