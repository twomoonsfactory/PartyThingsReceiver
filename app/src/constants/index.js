export default ngModule => {
  require('./gameEvents.js')(ngModule);
  require('./gameNumbers.js')(ngModule);
  require('./gameStates.js')(ngModule);
  require('./messageNames.js')(ngModule);
  require('./playerStates.js')(ngModule);
  require('./uiStates.js')(ngModule);
  require('./settings.js')(ngModule);
}
