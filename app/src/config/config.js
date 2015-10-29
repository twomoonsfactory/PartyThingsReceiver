export default ngModule => {
  ngModule.config(function($routeProvider, $locationProvider){
    //sets the views
    $routeProvider
    //welcome page
    .when('/welcome', {
      templateUrl: '../../views/welcome.html',
      controller: 'welcomeController'
    })

    //gameplay page
    .when('/gameplay',{
      templateUrl: '../../views/gameplay.html',
      controller: 'gameController'
    })

    //gameend page
    .when('/gameEnd',{
      templateUrl: '../../views/gameEnd.html',
      controller: 'gameEndController'
    })

    //default to welcome
    .otherwise({
      redirectTo: '/welcome'
    });
  });
}
