var EventEmitter = require("events").EventEmitter;
var app = require("./lib/app");
var utils = require("./lib/utils");

function tdk ( cwd, argv ) {
  
  function task ( ) {
    this.task.apply(this, arguments);
  }
  
  EventEmitter.call(task);
  
  utils.merge(task, app);
  
  task.init(cwd, argv);
  
  return task;
  
}

tdk.app = app;

tdk.start = function ( cwd, argv ) {
  return tdk(cwd, argv).start();
};

module.exports = tdk;
