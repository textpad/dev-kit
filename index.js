var app = require("./lib/app");
var utils = require("./lib/utils");

function tdk ( cwd, argv ) {
  
  function define ( ) {
    this.define.apply(this, arguments);
  }
  
  utils.merge(define, app);
  
  define.init(cwd, argv);
  delete define.init;
  
  return define;
  
}

tdk.app = app;

tdk.start = function ( cwd, argv ) {
  return tdk(cwd, argv).start();
};

module.exports = tdk;
