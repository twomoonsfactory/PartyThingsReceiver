export default ngModule =>{
  require('./eventService.js')(ngModule);
  require('./fakePlayerProvider.js')(ngModule); //for testing and demo purposes only
  require('./gameDriver.js')(ngModule);
  require('./guessHandler.js')(ngModule);
  require('./messageProvider.js')(ngModule);
  require('./playerHandler.js')(ngModule);
  require('./promptProvider.js')(ngModule);
  require('./responseHandler.js')(ngModule);
  require('./responseProvider.js')(ngModule);
  require('./stateManager.js')(ngModule);
}
