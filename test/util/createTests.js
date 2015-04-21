"use strict";

module.exports = function( options ) {
	var keys = Object.keys( options.possibilities );
	function createTests( currentKeys, object ) {
		if ( currentKeys.length ) {
			var currentKey = currentKeys[ 0 ];
			var tail = currentKeys.slice( 1 );
			options.possibilities[ currentKey ].forEach( function( value ) {
				object[ currentKey ] = value;
				createTests( tail, object );
			} );
		} else {
			var copy = {};
			keys.forEach( function( key ) {
				copy[ key ] = object[ key ];
			} );
			if ( !options.check || options.check( copy ) ) {
				options.target[ options.name( copy ) ] = options.factory( copy );
			}
		}
	}
	createTests( keys, {} );
};
