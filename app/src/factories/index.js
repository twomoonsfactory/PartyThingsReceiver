require('../../core/vendor')();

import guess from './guess.js';
import player from './player.js';
import response from './response.js'

module.export = angular.module('gameMasterFactories', [])
  .factory(guess)
  .factory(player)
  .factory(response);
