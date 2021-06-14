/**
 * Debug
 */

DEBUGMODE = false;

if (DEBUGMODE)
	window.log = Function.prototype.bind.call(console.log, console);
else
	window.log = function() {};