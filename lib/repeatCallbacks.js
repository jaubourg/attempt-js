"use strict";

var later = require( "./later" );

module.exports = function() {
	var callbacks = [];
	var args;
	var active = true;
	return {
		a: function( callback ) {
			if ( callbacks ) {
				callbacks.push( callback );
			}
			if ( args ) {
				later( callback, args );
			}
			return this;
		},
		f: function() {
			if ( active ) {
				args = arguments;
				for ( var i = 0, length = callbacks.length; i < length; i++ ) {
					later( callbacks[ i ], args );
				}
			}
		},
		l: function() {
			active = callbacks = null;
		}
	};
};
