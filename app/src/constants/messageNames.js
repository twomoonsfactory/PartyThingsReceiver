module.exports = angular.module('gameMaster')
	.constant('messageNames', {
		nameGame : "nameGame",
		namePlayer : "namePlayer",
		waitingToStart : "waitingToStart",
		standBy : "standBy",
		standingByReadyRequest : "standingByReadyRequest",
		readyRequest : "readyRequest",
		readyConfirm : "readyConfirm",
		lastReadyConfirm : "lastReadyConfirm",
		promptConfirm : "promptConfirm",
		responseRequest : "responseRequest",
		responseConfirm : "responseConfirm",
		guessRequest : "guessRequest",
		guessConfirm : "guessConfirm",
		guessRemain : "guessRemain",
		winner : "winner",
		endGame : "endGame",
		quit : "quit"
	});