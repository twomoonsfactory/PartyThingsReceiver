require('../../core/vendor')();

import gameEnd from './gameEnd.js';
import guessesSorted from './guessesSorted.js';
import guessRequest from './guessRequest.js';
import playerDisplay from './playerDisplay.js';
import playerNames from './playerNames.js';
import promptRequest from './promptRequest.js';
import responseRequest from './responseRequest.js';

module.export = angular.module('gameMasterDirectives', [])
  .directive(gameEnd)
  .directive(guessesSorted)
  .directive(guessRequest)
  .directive(playerDisplay)
  .directive(playerNames)
  .directive(promptRequest)
  .directive(responseRequest);
