"use strict";

var Attempt = require( "../lib/Attempt.js" );
var forEachAction = require( "../lib/forEachAction.js" );

var callForType = require( "./util/callForType.js" );
var createTests = require( "./util/createTests.js" );

createTests( {
	target: module.exports,
	possibilities: {
		noAbortOutcome: [ "success", "failure" ],
		async: [ true, false ],
		abortable: [ true, false ],
		callAbort: [ true, false ],
		abortCalled: [ true ],
		outcome: [ true ]
	},
	check: function( options ) {
		if ( options.callAbort && !options.abortable ) {
			return false;
		}
		options.abortCalled = options.async && options.callAbort;
		options.outcome = options.abortCalled ? undefined : options.noAbortOutcome;
		return true;
	},
	name: function( options ) {
		var syncString = options.async ? " async " : " sync ";
		if ( !options.abortable ) {
			return "non-abortable" + syncString + options.outcome;
		}
		return "abortable" + syncString + options.noAbortOutcome + " / " + ( options.callAbort ? "" : "no " ) +
			"abort => " + ( options.outcome || "<silent>" );
	},
	factory: function( options ) {
		return function( __ ) {
			__.expect(
				1 +
					( options.callAbort ? 1 : 0 ) +
					( options.abortCalled ? 1 : 0 ) +
					( options.outcome ? 1 : 0 )
			);
			var attempt = new Attempt( function() {
				var aborted = false;
				var notifiers = arguments;
				function doIt() {
					if ( !aborted ) {
						callForType( notifiers, false, options.noAbortOutcome, "OK" );
					}
				}
				if ( options.async ) {
					setTimeout( doIt, 10 );
				} else {
					doIt();
				}
				return options.abortable && function() {
					__.ok( options.abortCalled, "aborted" );
					aborted = true;
				};
			} );
			__.strictEqual( !!attempt.abort, !!options.abortable, "abortable: " + options.abortable );
			if ( options.callAbort ) {
				__.strictEqual( attempt.abort(), !!options.abortCalled, "abort: " + options.abortCalled );
			}
			forEachAction( function( methodName ) {
				attempt[ methodName ]( function( value ) {
					if ( options.outcome ) {
						__.strictEqual( value, "OK", methodName + " OK" );
					} else {
						__.ok( false, methodName + " NOK (" + value + ")" );
					}
				} );
			} );
			setTimeout( function() {
				__.done();
			}, 20 );
		};
	}
} );
