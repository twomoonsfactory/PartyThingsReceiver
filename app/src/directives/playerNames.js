module.exports = function(){
	return{
		scope: {
			playerData: '='
		},
		link: function(scope, elem, attrs){
			var playerMap = {};
			var holders = _.shuffle(elem[0].getElementsByClassName('playername-placeholder'));
			var displayedPlayers = [];
			function resolvePlaceholders(){
				var toAdd = _.difference(playerData, displayedPlayers);
				var toDrop = _.difference(displayedPlayers, playerData);
				_.forEach(toAdd, function(newPlayer){
					playerMap[newPlayer.playerName] = holders [0];
					holders.splice(0,1);
					playerMap[newPlayer.playerName].innerHTML = "<div class='playerHolder'>"+newPlayer.playerName+"</div>";
					displayedPlayers.push(newPlayer);
				});
				_.forEach(toDrop, function(oldPlayer){
					playerMap[oldPlayer.playerName].innerHTML = "";
					holders.push[oldPlayer.playerName];
					holders = _.shuffle(holders);
					delete playerMap[oldPlayer.playerName];
					displayedPlayers.splice(_.indexOf(oldPlayer),1);
				});
			};

			scope.$watchCollection(scope.playerData, function(){
				resolvePlaceholders();
			});
		}
	}
}