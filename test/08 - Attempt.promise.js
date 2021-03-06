"use strict";

require( "./util/Promise" );

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
	test: function( options, __ ) {
		__.expect( 2 );
		var promise = Attempt( function( success, failure ) {
			var func = options.outcome === "success" ? success : failure;
			if ( options.async ) {
				setTimeout( function() {
					func( "OK" );
				}, 10 );
			} else {
				func( "OK" );
			}
		} ).promise();
		__.ok( promise instanceof Promise, "returns a promise" );
		function handler( type ) {
			return options.outcome === type ? function( value ) {
				__.strictEqual( value, "OK", type );
				__.done();
			} : function() {
				__.ok( false, type );
				__.done();
			};
		}
		promise.then( handler( "success" ), handler( "failure" ) );
	}
} );

createTests( {
	target: module.exports,
	possibilities: {
		outcome: [ "success", "failure" ],
		async: [ true, false ]
	},
	name: function( options ) {
		return "Attempt( promise )" + ( options.async ? " async " : " sync " ) + options.outcome;
	},
	test: function( options, __ ) {
		__.expect( 1 );
		function handler( type ) {
			return options.outcome === type ? function( value ) {
				__.strictEqual( value, "OK", type );
			} : function() {
				__.ok( false, type );
			};
		}
		Attempt( new Promise( function( success, failure ) {
			var func = options.outcome === "success" ? success : failure;
			if ( options.async ) {
				setTimeout( function() {
					func( "OK" );
				}, 10 );
			} else {
				func( "OK" );
			}
		} ) ).success( handler( "success" ) ).failure( handler( "failure" ) ).always( function() {
			__.done();
		} );
	}
} );
