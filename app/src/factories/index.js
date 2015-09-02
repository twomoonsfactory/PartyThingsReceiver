export default ngModule => {
  require('./guessFactory.js')(ngModule);
  require('./playerFactory.js')(ngModule);
  require('./responseFactory.js')(ngModule);
}
