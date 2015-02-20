// required modules
var app = require("./lib/app");
var utils = require("./lib/utils");

// app constructor
function tdk ( cwd, argv ) {
  
  // the main method is just an alias to `app#define`
  function define ( ) {
    this.define.apply(this, arguments);
  }
  
  // add the app methods
  utils.merge(define, app);
  
  // initiate the app, deleting the `app#init` method
  // afterwords to prevent it from being called again
  define.init(cwd, argv);
  delete define.init;
  
  // return the app
  return define;
  
}

// expose the app object as a prototype
tdk.prototype = tdk.app = tdk.fn = app;

// the `app#init` just sets-up internal stuff, after that
// user should set up their stuff, then `app#start` should
// be called, which should run any required tasks
tdk.start = function ( cwd, argv ) {
  return tdk(cwd, argv).start();
};

// export
module.exports = tdk;
