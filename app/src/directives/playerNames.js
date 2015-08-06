export default ngModule => {
	ngModule.directive('playerNames', ()=>{
		return{
			scope: {
				playerData: '='
			},
			link: (scope, elem, attrs) => {
				let playerMap = {};
				let holders = _.shuffle(elem[0].getElementsByClassName('playername-placeholder'));
				let displayedPlayers = [];
				let resolvePlaceholders = () => {
					let toAdd = _.difference(scope.playerData, displayedPlayers);
					let toDrop = _.difference(displayedPlayers, scope.playerData);
					_.forEach(toAdd, (newPlayer) => {
						playerMap[newPlayer.playerName] = holders [0];
						holders.splice(0,1);
						playerMap[newPlayer.playerName].innerHTML = "<div class='playerHolder'>"+newPlayer.playerName+"</div>";
						displayedPlayers.push(newPlayer);
					});
					_.forEach(toDrop, (oldPlayer) => {
						playerMap[oldPlayer.playerName].innerHTML = "";
						holders.push[oldPlayer.playerName];
						holders = _.shuffle(holders);
						delete playerMap[oldPlayer.playerName];
						displayedPlayers.splice(_.indexOf(oldPlayer),1);
					});
				};

				scope.$watchCollection("playerData", ()=>{
					resolvePlaceholders();
				});
			}
		}
	})
}
