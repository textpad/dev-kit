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

// config file loader
exports.load = function ( app, opts ) {
  
  // get the config's filename, and its extension
  var filename = opts.config, ext = fs.extname(filename), config, content;
  
  // some module loaders append 'index.*' to directories passed as filenames,
  // so checking for a filename wouldn't always pass true, so we check
  // if the filename exists, regardless of what it is
  app.assert(fs.existsSync(filename), "could not find '%s' config file.", filename);
  
  // (Iced) CoffeeScript also parse's Markdown files...
  if ( ext === '.md' ) {
    if ( CoffeeScript.isLiterate(filename) ) ext = '.coffee';
    else if ( IcedScript.isLiterate(filename) ) ext = '.iced';
  }
  
  // some loaders use their own methods to load files, others only parse strings...
  function data ( ) {
    return content ? content : content = fs.readFileSync(filename);
  }
  
  // set each value of the config as a setting within the app.
  // allows to mount settings as namespaced objects if the value is a hash object
  function mountOptions ( object, prefix ) {
    utils.each(object, function(value, setting){
      setting = (prefix ? prefix + "." : "") + setting;
      if ( utils.isObject(value) ) {
        mountOptions(value, setting);
      }
      app.set(setting, value);
    });
  }
  
  // wrap the loading in a try-catch statement so we can forward
  // any errors to the currently running tdk app
  try {
    
    switch ( ext ) {
      
      /* http://npmjs.com/package/ini */
      case '.ini':
      case '.config':
        config = ini.parse(data());
        break;
      
      /* http://npmjs.com/package/js-yaml */
      case '.yml':
      case '.yaml':
        yaml.loadAll(data(), function(doc){
          utils.merge(config, doc);
        });
        break;
      
      // we use 'http://npmjs.com/package/strip-json-comments' to
      // strip the comments and then the native 'JSON.parse'
      case '.json':
        config = JSON.parse(stripJsonComments(data()));
        break;
      
      /* http://npmjs.com/package/json5 */
      case '.json5':
        config = JSON5.parse(data());
        break;
      
      /* http://npmjs.com/package/hjson */
      case '.hjson':
        config = Hjson.parse(data());
        break;
      
      /* http://npmjs.com/package/toml */
      case '.toml':
        config = toml.parse(data());
        break;
      
      /* http://npmjs.com/package/cson */
      case '.cson':
        config = CSON.parse(data());
        break;
      
      /* http://npmjs.com/package/properties */
      case '.properties':
        config = properties.parse(data(), {
          namespaces: true, variables: true, sections: true }
        );
        break;
      
      /* http://npmjs.com/package/coffee-script */
      case '.coffee':
      case '.litcoffee':
        CoffeeScript.register();
        config = require(filename);
        break;
      
      /* http://npmjs.com/package/iced-coffee-script */
      case '.iced':
      case '.liticed':
        IcedScript.register();
        config = require(filename);
        break;
      
      /* http://npmjs.com/package/oli */
      case '.oli':
        config = oli.parse(data(), {
          locals: { env: process.env }
        });
        break;
      
      /* http://npmjs.com/package/xml2js */
      case '.xml':
        config = xml2js.parseString(data());
        break;
      
      // assume the file can be loaded by require...
      default:
        config = require(filename);
      
    }
    
  } catch ( e ) {
    
    // send the error to the tdk app
    app.error(e);
    
  } finally {
    
    // confirm we have something...
    if ( config ) {
      
      // if its a function, call it with the tdk app as its scope (`this` object)
      // and the parsed argv and tdk app as the arguments.
      if ( utils.isFunction(config) ) {
        config = config.call(app, opts, app);
      }
      
      // confirm we have a object, else error out
      app.assert(utils.isObject(config), "The config file must return a JavaScript Hash (Key/Value) Object.");
      
      // apply the default settings to the options, and then the options to
      // the config, assuring we have all the required settings
      utils.defaults(opts, exports.defaults);
      utils.defaults(config, opts);
      
      // finally, set app settings
      mountOptions(config);
      
    }
    
  }
  
};
