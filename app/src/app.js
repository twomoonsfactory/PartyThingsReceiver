
module.exports = angular.module('gameMaster', ['ngRoute', require('./castServices.js').name])
	.config(function($routeProvider, $locationProvider){
		$routeProvider

		//welcome page
		.when('/welcome', {
			templateUrl: '../views/welcome.html'
		})

		//gameplay page
		.when('/gameplay',{
			templateUrl: '../views/gameplay.html'
		})

		//default to welcome
		.otherwise({
			redirectTo: '/welcome'
		})
	})
	//controllers
	.controller('gameController', require('./controllers/gameController.js'))
	.controller('playerController', require('./controllers/playerController.js'))
	//directives
	.directive('playerDisplay', require('./directives/playerDisplay.js'))
	//factories
	.factory('guess', require('./factories/guess.js'))
	.factory('player', require('./factories/player.js'))
	.factory('response', require('./factories/response.js'))
	//services
	.service('eventService', require('./services/eventService.js'))
	.service('gameDriver', require('./services/gameDriver.js'))
	.service('guessHandler', require('./services/guessHandler.js'))
	.service('messageProvider', require('./services/messageProvider.js'))
	.service('playerHandler', require('./services/playerHandler.js'))
	.service('promptProvider', require('./services/promptProvider.js'))
	.service('responseHandler', require('./services/responseHandler.js'))
	.service('responseProvider', require('./services/responseProvider.js'))
	.service('stateManager', require('./services/stateManager.js'))
	//constants
	.constant('gameEvents', {
		playerJoined: "playerJoined",
		readyReceived: "readyReceived",
		voteReceived: "voteReceived",
		thingReceived: "thingReceived",
		guessReceived: "guessReceived",
		gamenameReceived: "gamenameReceived",
		gameNamed: "gameNamed",
		playernameReceived: "playernameReceived",
		quitReceived: "quitReceived"
	})
	.constant('gameStates', {
		WaitingForStart: "WaitingForStart",
		ReadyToStart: "ReadyToStart",
		WaitingForReady: "WaitingForReady",
		PlayersReady: "PlayersReady",
		PromptChosen: "PromptChosen",
		ResponsesReceived: "ResponsesReceived",
		RoundEnd: "RoundEnd",
		GameEnd: "GameEnd"
	})
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
	})
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
console.log('thingy');
//all display changes still need to be written in -- all internal except the basic test at the moment
//abstract out text  