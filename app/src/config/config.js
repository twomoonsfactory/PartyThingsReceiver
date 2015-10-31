export default ngModule => {
  ngModule.config(function($routeProvider, $locationProvider){
    //sets the views
    $routeProvider
    //welcome page
    .when('/welcome', {
      template: require('../../views/welcome.html'),
      controller: 'welcomeController'
    })

    //gameplay page
    .when('/gameplay',{
      template: require('../../views/gameplay.html'),
      controller: 'gameController'
    })

    //gameend page
    .when('/gameEnd',{
      template: require('../../views/gameEnd.html'),
      controller: 'gameEndController'
    })

    //default to welcome
    .otherwise({
      redirectTo: '/welcome'
    });
  });
}
