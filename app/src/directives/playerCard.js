export default ngModule =>{
	ngModule.directive('playerCard', ['$q', '$timeout', ($q, $timeout)=>{
		return {
			restrict: 'A',
      scope: {
        player: "=playerCard"
      },
			template: '<div class="playerCardFront"><i class="fa fa-mixcloud fa-lg"></i>&nbsp;Incoming...</div><div class="playerCardBack">{{name}}</div>',
      link: (scope, elem, attrs) =>{
        scope.name = scope.player.playerName;
        scope.waitingForName = true;
				scope.$watch('player.playerName', ()=>{
          if(scope.waitingForName && scope.player.state!=="incoming"){
						scope.name = scope.player.playerName;
            scope.waitingForName = false;
            elem.addClass('flipped');
						$timeout(()=>{
	            scope.$apply();
	          });
          }
        }, true);
      }
		}
	}])
}
