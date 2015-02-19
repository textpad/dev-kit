var EventEmitter = require("events").EventEmitter;
var utils = require("./utils");

exports = module.exports = function ( app ) {
  utils.merge(app, EventEmitter.prototype);
  EventEmitter.call(app);
};
