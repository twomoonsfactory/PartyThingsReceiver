require('../../core/vendor')();

import gameEvents from './gameEvents.js';
import gameStates from './gameStates.js';
import messageNames from './messageNames.js';
import playerStates from './playerStates.js';

module.export = angular.module('gameMasterConstants', [])
  .constant(gameEvents)
  .constant(gameStates)
  .constant(messageNames)
  .constant(playerStates);
