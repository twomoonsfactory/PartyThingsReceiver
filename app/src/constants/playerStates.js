module.exports = angular.module('gameMaster')
	.constant('playerStates', {
		ready: "ready",
		quit: "quit",
		standingBy: "standingBy",
		waiting: "waiting",	
		readyRequested: "readyRequested",
		voting: "voting",
		writing: "writing",
		guessing: "guessing"
	});