export default ngModule => {
  class responseProvider{
    constructor($log, $http, eventService, gameEvents){
        this.$log = $log;
        this.$http = $http;
        this.eventService = eventService;
        this.gameEvents = gameEvents;

        this.responses = [];

        this.subscribeToGameEvents();
    }

    subscribeToGameEvents(){
      this.eventService.subscribe(this.gameEvents.welcomeLoaded, this.loadResponses.bind(this))
    }

    loadResponses(){
      this.$http.get("https://drive.google.com/open?id=0B_DuTdjS_hLtREhrMDI5SE9ubDQ")
        .success(data => {
          this.responses = data.responses;
          this.$log.log("Responses loaded in...");
        })
        .error(data => {
          this.$log.log("error reading responses");
        });
    }

    getRandomResponse(){
      let randomResponse = _.sample(this.responses);
      return randomResponse;
    }
  }
  responseProvider.$inject = ['$log', '$http', 'eventService', 'gameEvents'];
  ngModule.service('responseProvider', responseProvider);
}
