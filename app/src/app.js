
module.exports = angular.module('gameMaster', ['ngRoute', require('./castServices.js').name])
	.config(function($routeProvider, $locationProvider){
		$routeProvider

		//welcome page
		.when('/welcome', {
			templateUrl: '../views/welcome.html',
			controller: 'welcomeController'
		})

		//gameplay page
		.when('/gameplay',{
			templateUrl: '../views/gameplay.html',
			controller: 'gameController'
		})

		//default to welcome
		.otherwise({
			redirectTo: '/welcome'
		})
	})
	//controllers
	.controller('gameController', require('./controllers/gameController.js'))
	.controller('welcomeController', require('./controllers/welcomeController.js'))
	//directives
	.directive('playerDisplay', require('./directives/playerDisplay.js'))
	.directive('playerNames', require('./directives/playerNames.js'))
	.directive('promptRequest', require('./directives/promptRequest.js'))
	.directive('responseRequest', require('./directives/responseRequest.js'))
	.directive('guessRequest', require('./directives/guessRequest.js'))
	.directive('guessesSorted', require('./directives/guessesSorted.js'))
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
		responseReceived: "responseReceived",
		guessReceived: "guessReceived",
		guessesResolved: "guessesResolved",
		guessesSorted: "guessesSorted",
		gamenameReceived: "gamenameReceived",
		gameNamed: "gameNamed",
		messageLoaded: "messageLoaded",
		messagesUpdated: "messagesUpdated",
		playernameReceived: "playernameReceived",
		playerUpdated: "playerUpdated",
		playersUpdated: "playersUpdated",
		promptsLoaded: "promptsLoaded",
		quitReceived: "quitReceived",
		stateUpdated: "stateUpdated",
		welcomeLoaded: "welcomeLoaded"
	})
	.constant('gameStates', {
		WaitingForStart: "WaitingForStart",
		WaitingForReady: "WaitingForReady",
		ReadyToStart: "ReadyToStart",
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
		quit : "quit",
		screenInitialize: "screenInitialize",
		screenWelcome: "screenWelcome",
		screenReady: "screenReady",
		screenRequestPrompt: "screenRequestPrompt",
		screenRequestResponse: "screenRequestResponse",
		screenRequestGuess: "screenRequestGuess",
		screenRoundResults: "screenRoundResults",
		screenGameResults: "screenGameResults",
		bannerRequestPrompt: "bannerRequestPrompt",
		bannerRequestResponse: "bannerRequestResponse",
		bannerRequestGuess: "bannerRequestGuess",
		bannerRoundResults: "bannerRoundResults",
		bannerGameResults: "bannerGameResults"
	})
	.constant('playerStates', {
		incoming: "incoming",
		ready: "ready",
		quit: "quit",
		standingBy: "standingBy",
		waiting: "waiting",
		readyRequested: "readyRequested",
		voting: "voting",
		writing: "writing",
		guessing: "guessing"
	});
//all display changes still need to be written in -- all internal except the basic test at the moment
//abstract out text
