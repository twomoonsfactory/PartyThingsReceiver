export default ngModule =>{
	ngModule.directive('playerCard', ['$q', '$timeout', ($q, $timeout)=>{
		return {
			restrict: 'A',
      scope: {
        player: "=playerCard"
      },
			template: '<div class="gameMessageContainer"><div class="messageFront">Incoming...</div><div class="messageBack">{{message2}}</div><div>',
      link: (scope, elem, attrs) =>{
        scope.name = "";
        scope.waitingForName = true;
				scope.$watch('player', ()=>{
          if(scope.waitingForName){
            scope.name = scope.player.playerName;
            scope.waitingForName = false;
            elem.addClass('flipped');
          }
        });
      }
		}
	}])
}
