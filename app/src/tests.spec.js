require('../core/vendor.js');
let appModule = require('../index.js');
let context;
context = require.context('../src', true, /promptProvider\.spec\.js$/);
context.keys().forEach(context);
