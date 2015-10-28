export default ngModule =>{
  ngModule.controller('toastCtrl', ['$scope', '$mdToast', function($scope, $mdToast){
    $scope.closeToast = ()=>{
      $mdToast.hide();
    };
  }]);
}
