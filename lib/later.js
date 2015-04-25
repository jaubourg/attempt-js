"use strict";

function later( func, args ) {
	setImmediate( function() {
		func.apply( null, args || [] );
	} );
}

module.exports = later;
