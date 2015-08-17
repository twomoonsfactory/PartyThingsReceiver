export default class eventService{
  constructor($log, gameEvents, gameStates){
    this.log = $log;
    this.gameEvents = gameEvents;
    this.gameStates = gameStates;
    this.subs = {};
  }
  //takes subscriptions, functions to be called on a specific event being published.
  subscribe(eventId, subscriber) {
    //handle invalid events to subscribe to
    if(!(_.contains(this.gameEvents, eventId))&&!(_.contains(this.gameStates, eventId))){
    	this.$log.log('Invalid eventId subscribed: ' + eventId);
    }
    else{
      if(!this.subs[eventId]){
        this.subs[eventId] = [];
      }
      this.subs[eventId].push(subscriber);
    }
  };
  //publishes a specific event, calling the arguments, if any.
  publish(eventId, args) {
    if(!this.subs[eventId]){
      if(_.contains(this.gameEvents,eventId)||_.contains(this.gameStates,eventId))
        $log.log('No subscribers');
      else
        $log.log('Invalid eventId published: ' + eventId);
    }
    else{
      _.each(this.subs[eventId], subscriber => {
        subscriber(args);
      });
    }
  }
}
eventService.$inject = ['$log', 'gameEvents', 'gameStates'];
