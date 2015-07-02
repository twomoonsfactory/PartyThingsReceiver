module.exports = function($log, gameEvents, gameStates){
      var self = this;
      self.subs = {};
      //takes subscriptions, functions to be called on a specific event being published.
      this.subscribe = function(eventId, subscriber){
        $log.log(arguments.callee.caller.name);
        //handle invalid events to subscribe to
        if(!(_.contains(gameEvents, eventId))&&!(_.contains(gameStates, eventId))){
        	$log.log('Invalid eventId subscribed: ' + eventId);
        }
        else{
	        if(!self.subs[eventId]){
	          self.subs[eventId] = [];
	        }
	        self.subs[eventId].push(subscriber);
        }
      };
      //publishes a specific event, calling the arguments, if any.
      this.publish = function(eventId, args){
        if(!self.subs[eventId]){
          if(_.contains(gameEvents,eventId)||_.contains(gameStates,eventId))
            $log.log('No subscribers');
          else
            $log.log('Invalid eventId published: ' + eventId);
        }
        else{
          _.each(self.subs[eventId], function(subscriber){
            subscriber(args);
          });
        }
      }
	};