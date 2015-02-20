// required modules
var debug = require("debug");
var assert = require("assert");
var utils = require("./utils");

// the setup for the tdk console logging methods.
// this is placed here so that `exports` can be merged into
// the supplied tdk app instance, allowing for addtional or
// replaced console methods before an app is started.
exports = module.exports = function ( app ) {
  
  // set the default options
  app.disable('debug');
  app.disable('silent');
  app.set("warning-label", "WARNING: ");
  app.set("error-label", "ERROR: ");
  
  // create the console logger
  app.debugger = debug(this.name);
  
  // merge the `exports` into the tdk app
  utils.merge(app, exports);
  
};

// basic log/debug messages. these are not displayed unless
// the setting `debug` is enabled (`true`)
exports.log = function ( message ) {
  if ( this.enabled('debug') ) {
    if ( arguments.length > 1 ) this.debugger(message);
    else this.debugger.apply(this.debugger, arguments);
  }
};

// warnings are messeages that are not important but the user
// should be aware of their message. always displayed unless
// the the setting `silent` is enabled (`true`)
exports.warn = function ( warning ) {
  if ( this.disabled('silent') ) {
    warning = this.get("warning-label") + warning;
    if ( arguments.length > 1 ) this.debugger(warning);
    else this.debugger.apply(this.debugger, arguments);
  }
};

// errors are messages that require urgent attention, therefore
// the app is terminated after displaying them. always displayed
// unless the the setting `silent` is enabled (`true`)
exports.error = function ( error ) {
  if ( this.disabled('silent') ) {
    error = this.get("error-label") + error;
    if ( arguments.length > 1 ) this.debugger(error);
    else this.debugger.apply(this.debugger, arguments);
  }
  this.exit(1);
};

// a wrapper around assert to allow `console.log` like formatting
exports.assert = function ( value, message ) {
  if ( arguments.length > 2 ) {
    message = utils.format.apply(null, utils.slice(arguments, 1));
  }
  try {
    assert.ok(value, message);
  } catch ( e ) {
    this.error(e);
  }
};
