
//method will be invoked when user wants to log his messages
var config = require('../config/config');
var logLevel = config.LOGLEVEL;
console.log("Current logLevel :: "+ logLevel);

var emergency = module.exports.emergency = function(component, message) {
	var date = (new Date()).toUTCString();
	if(logLevel >= 0) {
		console.error("EMERGENCY  "+date + " : " + component+ " : " + message);
		return;
	}	
}

var alert = module.exports.alert = function(component, message) {
	var date = (new Date()).toUTCString();
	if(logLevel >= 1) {
		console.error("ALERT  "+date + " : " + component+ " : " + message);
		return;
	}	
}

var critical = module.exports.critical = function(component, message) {
	var date = (new Date()).toUTCString();
	if(logLevel >= 2) {
		console.error("CRITICAL  "+date + " : " + component+ " : " + message);
		return;
	}	
}

var error = module.exports.error = function(component, message) {
	var date = (new Date()).toUTCString();
	if(logLevel >= 3) {
		console.error("ERROR  "+date + " : " + component+ " : " + message);
		return;
	}	
}

var warn = module.exports.warn = function(component, message) {
	var date = (new Date()).toUTCString();
	if(logLevel >= 4) {
		console.warn("WARNING  "+date + " : " + component+ " : " + message);
		return;
	}	
}

var notice = module.exports.notice = function(component, message) {
	var date = (new Date()).toUTCString();
	if(logLevel >= 5) {
		console.warn("NOTICE  "+date + " : " + component+ " : " + message);
		return;
	}	
}

var info = module.exports.info = function(component, message) {
	var date = (new Date()).toUTCString();
	if(logLevel >= 6) {
		console.info("INFO  "+date + " : " + component+ " : " + message);
		return;
	}	
}

var debug = module.exports.debug = function(component, message) {
	var date = (new Date()).toUTCString();
	if(logLevel == 7) {
		console.log("DEBUG  "+date + " : " +component+ " : " + message);
		return;
	}
}

