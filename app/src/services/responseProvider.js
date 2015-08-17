export default class responseProvider{
  constructor($log, $http, eventService, gameEvents){
    //local variables
    self.responses = [];
    //local references to injected externals
    this.log = $log;
    this.http = $http;
    this.eventService = eventService;
    this.gameEvents = gameEvents;
    //event subscriptions
    this.eventService.subscribe(this.gameEvents.welcomeLoaded, this.loadResponses)
  }
  //loads responses from json
  loadResponses(){
    this.http.get("../src/resources/responses.json")
      .then(data => {
        self.responses = data.responses;
        this.log.log("Responses loaded in...");
      });
  }
  //returns a random response
  getRandomResponse(){
    let randomResponse = _.sample(self.responses);
    return randomResponse;
  }
}
responseProvider.$inject = ['$log', '$http', 'eventService', 'gameEvents'];
