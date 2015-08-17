require('../../core/vendor')();

import eventService from './eventService.js';
import gameDriver from './gameDriver.js';
import guessHandler from './guessHandler.js';
import messageProvider from './messageProvider.js';
import playerHandler from './playerHandler.js';
import promptProvider from './promptProvider.js';
import responseHandler from './responseHandler.js';
import responseProvider from './responseProvider.js';
import stateManager from './stateManager.js';

module.export = angular.module('gameMasterServices', [])
  .service(eventService)
  .service(gameDriver)
  .service(guessHandler)
  .service(messageProvider)
  .service(playerHandler)
  .service(promptProvider)
  .service(responseHandler)
  .service(responseProvider)
  .service(stateManager);
