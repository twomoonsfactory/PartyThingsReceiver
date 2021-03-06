export default ngModule =>{
	ngModule.directive('gameMessageSlip', ['$q', '$timeout', ($q, $timeout)=>{
		return {
			restrict: 'A',
      scope: {
        gameMessage: "=gameMessageSlip"
      },
			template: '<div class="messageFront"><h3 class="messageText">{{message1}}</h3></div><div class="messageBack"><h3 class="messageText">{{message2}}</h3></div>',
      link: (scope, elem, attrs) =>{
        scope.message1 = scope.gameMessage;
        scope.message2 = "";
        scope.onMessage1 = true;
        elem.addClass('gameMessageContainer');
				scope.$watch('gameMessage', ()=>{
          if(scope.onMessage1){
            scope.message2 = scope.gameMessage;
            scope.onMessage1 = false;
            elem.addClass('flipped md-accent');
						$timeout(()=>{
							scope.$apply();
						});
          }
          else{
            scope.message1 = scope.gameMessage;
            scope.onMessage1 = true;
            elem.removeClass('flipped md-accent');
						$timeout(()=>{
							scope.$apply();
						});
          }
        });
      }
		}
	}])
}
