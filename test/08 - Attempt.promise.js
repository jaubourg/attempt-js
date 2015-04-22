/* global Promise */

"use strict";

var Attempt = require( "../lib/Attempt.js" );
var createTests = require( "./util/createTests" );

createTests( {
	target: module.exports,
	possibilities: {
		outcome: [ "success", "failure" ],
		async: [ true, false ]
	},
	name: function( options ) {
		return ".promise() for" + ( options.async ? " async " : " sync " ) + options.outcome;
	},
	factory: function( options ) {
		return function( __ ) {
			__.expect( 2 );
			var promise = new Attempt( function( success, failure ) {
				var func = options.outcome === "success" ? success : failure;
				if ( options.async ) {
					setTimeout( func, 10, "OK" );
				} else {
					func( "OK" );
				}
			} ).promise();
			__.ok( promise instanceof Promise, "returns a promise" );
			function handler( type ) {
				return options.outcome === type ? function( value ) {
					__.strictEqual( value, "OK", type );
				} : function() {
					__.ok( false, type );
				};
			}
			promise.then( handler( "success" ), handler( "failure" ) );
			setTimeout( function() {
				__.done();
			}, 20 );
		};
	}
} );
