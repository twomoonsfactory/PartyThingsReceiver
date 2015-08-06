export default ngModule =>{
    require('./gameController.js')(ngModule);
    require('./gameEndController.js')(ngModule);
    require('./welcomeController.js')(ngModule);
}
