// require modules
var ini = require("ini");
var yaml = require('js-yaml');
var stripJsonComments = require("strip-json-comments");
var JSON5 = require('json5');
var Hjson = require('hjson');
var toml = require('toml');
var CSON = require('cson');
var properties = require ("properties");
var CoffeeScript = require("coffee-script");
var IcedScript = require("iced-coffee-script");
var oli = require('oli');
var xml2js = require('xml2js');
var fs = require("./fs");
var utils = require("./utils");

// default options
exports.defaults = {
  debug: false,
  silent: false,
  logFile: null
};

exports.load = function ( app, opts ) {
  
  var config, filename = opts.config, ext = fs.extname(filename), content;
  
  app.assert(fs.existsSync(filename), "could not find '%s' config file.", filename);
  
  if ( ext === '.md' ) {
    if ( CoffeeScript.isLiterate(filename) ) ext = '.coffee';
    else if ( IcedScript.isLiterate(filename) ) ext = '.iced';
  }
  
  function data ( ) {
    return content ? content : content = fs.readFileSync(filename);
  }
  
  try {
    
    switch ( ext ) {
      
      case '.ini':
      case '.config':
        config = ini.parse(data());
        break;
      
      case '.yml':
      case '.yaml':
        yaml.loadAll(data(), function(doc){
          utils.merge(config, doc);
        });
        break;
      
      case '.json':
        config = JSON.parse(stripJsonComments(data()));
        break;
      
      case '.json5':
        config = JSON5.parse(data());
        break;
      
      case '.hjson':
        config = Hjson.parse(data());
        break;
      
      case '.toml':
        config = toml.parse(data());
        break;
      
      case '.cson':
        config = CSON.parse(data());
        break;
      
      case '.properties':
        config = properties.parse(data(), {
          namespaces: true, variables: true, sections: true }
        );
        break;
      
      case '.coffee':
      case '.litcoffee':
        CoffeeScript.register();
        config = require(filename);
        break;
      
      case '.iced':
      case '.liticed':
        IcedScript.register();
        config = require(filename);
        break;
      
      case '.oli':
        config = oli.parse(data(), {
          locals: { env: process.env }
        });
        break;
      
      case '.xml':
        config = xml2js.parseString(data());
        break;
      
      default:
        config = require(config);
      
    }
    
  } catch ( e ) {
    
    app.error(e);
    
  } finally {
    
    if ( config ) {
      
      if ( utils.isFunction(config) ) {
        config = config.call(app, opts, app);
      }
      
      app.assert(utils.isObject(config), "The config file must return a JavaScript Hash (Key/Value) Object.");
      
      utils.defaults(opts, exports.defaults);
      utils.defaults(config, opts);
    
      utils.each(config, function(value, setting){
        app.set(setting, value);
      });
      
    }
    
  }
  
};
