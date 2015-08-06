export default ngModule => {
  ngModule.service('eventService', ['$log', 'gameEvents', 'gameStates', ($log, gameEvents, gameStates) => {
      let self = this;
      self.subs = {};
      //takes subscriptions, functions to be called on a specific event being published.
      this.subscribe = (eventId, subscriber) => {
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
      this.publish = (eventId, args) => {
        if(!self.subs[eventId]){
          if(_.contains(gameEvents,eventId)||_.contains(gameStates,eventId))
            $log.log('No subscribers');
          else
            $log.log('Invalid eventId published: ' + eventId);
        }
        else{
          _.each(self.subs[eventId], subscriber => {
            subscriber(args);
          });
        }
      }
	}])
}
