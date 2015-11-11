export default ngModule => {
  ngModule.config(function($mdThemingProvider){
    //sets the theming
    $mdThemingProvider.theme('default')
      .primaryPalette('indigo', {
        'default':'500',
        'hue-1':'50',
        'hue-2':'200',
        'hue-3':'700'
      })
      .accentPalette('deep-orange', {
        'default':'500',
        'hue-1':'50',
        'hue-2':'200',
        'hue-3':'700'
      });
  });
}
