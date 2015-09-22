export default ngModule => {
  require('./gameEnd.js')(ngModule);
  require('./guessesSorted.js')(ngModule);
  require('./guessRequest.js')(ngModule);
  require('./playerDisplay.js')(ngModule);
  require('./playerNames.js')(ngModule);
  require('./promptRequest.js')(ngModule);
  require('./responserequest.js')(ngModule);
}
