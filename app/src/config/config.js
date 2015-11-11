export default ngModule => {
  ngModule.config(($stateProvider, $urlRouterProvider, uiStates) => {
    //define the default
    $urlRouterProvider.otherwise("");
    //sets the views
    $stateProvider
    //welcome page
    .state(uiStates.welcome, {
      url: "",
      template: require('../../views/welcome.html'),
      controller: 'welcomeController'
    })

    //gameplay page
    .state(uiStates.gameplay,{
      template: require('../../views/gameplay.html'),
      controller: 'gameController'
    })

    //gameend page
    .state(uiStates.gameend,{
      template: require('../../views/gameEnd.html'),
      controller: 'gameEndController'
    });
  });
}
