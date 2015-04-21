"use strict";

var later = require( "./later" );

module.exports = function() {
	var callbacks = [];
	var args;
	var active = true;
	return {
		a: function( callback ) {
			if ( active ) {
				if ( args ) {
					later( callback, args );
				} else {
					callbacks.push( callback );
				}
			}
			return this;
		},
		f: function() {
			if ( active && !args ) {
				args = arguments;
				for ( var i = 0, length = callbacks.length; i < length; i++ ) {
					later( callbacks[ i ], args );
				}
				callbacks = null;
			}
		},
		l: function() {
			active = callbacks = null;
		}
	};
};
