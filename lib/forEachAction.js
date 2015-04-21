"use strict";

var actions = [ "success", "failure", "progress" ];

function forEachAction( array, callback ) {
	if ( !callback ) {
		return forEachAction( actions, array );
	}
	for ( var i = 2; i >= 0; i-- ) {
		callback( array[ i ], actions[ i ], i );
	}
}

module.exports = forEachAction;
