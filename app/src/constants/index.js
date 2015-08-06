export default ngModule => {
  require('./gameEvents.js')(ngModule);
  require('./gameStates.js')(ngModule);
  require('./messageNames.js')(ngModule);
  require('./playerStates.js')(ngModule);
}
