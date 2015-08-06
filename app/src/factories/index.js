export default ngModule => {
  require('./guess.js')(ngModule);
  require('./player.js')(ngModule);
  require('./response.js')(ngModule);
}
