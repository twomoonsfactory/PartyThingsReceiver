export default ngModule => {
  require('./gameMessageSlip.js')(ngModule);
  require('./guessDisplay.js')(ngModule);
  require('./guessesDisplayed.js')(ngModule);
  require('./guessRequest.js')(ngModule);
  require('./numberIterator.js')(ngModule);
  require('./playerCard.js')(ngModule);
  require('./playerDisplay.js')(ngModule);
  require('./playerGuessDisplay.js')(ngModule);
  require('./promptRequest.js')(ngModule);
  require('./responseGuessDisplay.js')(ngModule);
  require('./responseRequest.js')(ngModule);
  require('./responseSlip.js')(ngModule);
}
