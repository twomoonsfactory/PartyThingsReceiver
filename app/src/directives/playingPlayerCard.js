export default ngModule =>{
	ngModule.directive('playingPlayerCard', ['$q', '$timeout', ($q, $timeout)=>{
		return {
			restrict: 'A',
      scope: {
        player: "=playingPlayerCard"
      },
			template: require('./playingPlayerCard.html'),
      link: (scope, elem, attrs) =>{
				elem.addClass('playingPlayer');
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
