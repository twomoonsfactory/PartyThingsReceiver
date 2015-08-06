export default ngModule => {
  ngModule.service('responseProvider', ['$log', '$http', 'eventService', 'gameEvents', ($log, $http, eventService, gameEvents) => {
        let self = this;
        self.responses = [];
        this.loadResponses = () => {
          $http.get("../src/resources/responses.json")
            .success(data => {
              self.responses = data.responses;
              $log.log("Responses loaded in...");
            })
            .error(data => {
              $log.log("error reading responses");
            });
        }
        eventService.subscribe(gameEvents.welcomeLoaded, this.loadResponses)

        this.getRandomResponse = () => {
          let randomResponse = _.sample(self.responses);
          return randomResponse;
        }
      }])
}
