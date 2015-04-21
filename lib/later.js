"use strict";

function later( func, args ) {
	setTimeout( function() {
		func.apply( null, args );
	} );
}

module.exports = later;
