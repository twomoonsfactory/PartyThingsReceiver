require('../../core/vendor')();

import gameController from './gameController.js';
import gameEndController from './gameEndController.js';
import welcomeController from './welcomeController.js';

module.export = angular.module('gameMasterControllers', [])
  .controller(gameController)
  .controller(gameEndController)
  .controller(welcomeController);
