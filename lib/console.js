var debug = require("debug");
var assert = require("assert");
var utils = require("./utils");

exports = module.exports = function ( app ) {
  app.disable('debug');
  app.disable('silent');
  app.set("warning-label", "WARNING: ");
  app.set("error-label", "ERROR: ");
  app.debugger = debug(this.name);
  utils.merge(app, exports);
};

exports.log = function ( message ) {
  if ( this.enabled('debug') ) {
    if ( arguments.length > 1 ) this.debugger(message);
    else this.debugger.apply(this.debugger, arguments);
  }
};

exports.warn = function ( warning ) {
  if ( this.disabled('silent') ) {
    warning = this.get("warning-label") + warning;
    if ( arguments.length > 1 ) this.debugger(warning);
    else this.debugger.apply(this.debugger, arguments);
  }
};

exports.error = function ( error ) {
  if ( this.disabled('silent') ) {
    error = this.get("error-label") + error;
    if ( arguments.length > 1 ) this.debugger(error);
    else this.debugger.apply(this.debugger, arguments);
  }
  this.exit(1);
};

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
