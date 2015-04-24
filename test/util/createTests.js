"use strict";

var getKeys = Object.keys || function( object ) {
	var output = [];
	for ( var key in object ) {
		if ( object.hasOwnProperty( key ) ) {
			output.push( key );
		}
	}
	return output;
};

function forEach( array, callback ) {
	for ( var i = 0, length = array.length; i < length; i++ ) {
		callback( array[ i ], i, array );
	}
}

module.exports = function( options ) {
	var keys = getKeys( options.possibilities );
	function createTests( currentKeys, object ) {
		if ( currentKeys.length ) {
			var currentKey = currentKeys[ 0 ];
			var tail = currentKeys.slice( 1 );
			forEach( options.possibilities[ currentKey ], function( value ) {
				object[ currentKey ] = value;
				createTests( tail, object );
			} );
		} else {
			var copy = {};
			forEach( keys, function( key ) {
				copy[ key ] = object[ key ];
			} );
			if ( !options.check || options.check( copy ) ) {
				options.target[ options.name( copy ) ] = function( __ ) {
					options.test( copy, __ );
				};
			}
		}
	}
	createTests( keys, {} );
};
