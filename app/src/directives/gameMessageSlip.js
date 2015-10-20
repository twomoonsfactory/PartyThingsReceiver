export default ngModule =>{
	ngModule.directive('gameMessageSlip', ['$q', '$timeout', ($q, $timeout)=>{
		return {
			restrict: 'A',
      scope: {
        gameMessage: "=gameMessageSlip"
      },
			template: '<md-card class="md-whiteframe-4dp messageContainer" ng-class="{flipped:!onMessage1}"><div class="messageFront"><h3>{{message1}}</h3></div><div class="messageBack"><h3>{{message2}}</h3></div></md-card>',
      link: (scope, elem, attrs) =>{
        scope.message1 = scope.gameMessage;
        scope.message2 = "";
        scope.onMessage1 = true;
				scope.$watch('gameMessage', ()=>{
          scope.onMessage1 ? scope.message2 = scope.gameMessage : scope.message1 = scope.gameMessage;
          scope.onMessage1 ? scope.onMessage1 = false : scope.onMessage1 = true;
        });
      }
		}
	}])
}
