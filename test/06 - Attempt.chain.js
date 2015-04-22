"use strict";

var Attempt = require( "../lib/Attempt.js" );
var forEachAction = require( "../lib/forEachAction.js" );

var callForType = require( "./util/callForType.js" );
var createTests = require( "./util/createTests.js" );

createTests( {
	target: module.exports,
	possibilities: {
		before: [ "success", "failure", "progress" ],
		beforeAsync: [ false, true ],
		after: [ "success", "failure", "progress" ],
		afterAsync: [ false, true ]
	},
	name: function( options ) {
		return ( options.beforeAsync ? "Async " : "Sync " ) + options.before +
			" => " +
			( options.afterAsync ? "Async " : "Sync " ) + options.after;
	},
	test: function( options, __ ) {
		function expectedCallback( type, expectedType, expectedValue ) {
			return type === expectedType ? function( value ) {
				__.strictEqual( value, expectedValue, type + " ok (" + value + ")" );
			} : function( value ) {
				__.ok( false, "unexpected " + type + " (" + value + ")" );
			};
		}
		var attempt = new Attempt( function() {
			callForType( arguments, options.beforeAsync, options.before, 5 );
		} );
		var chainArgs = [];
		chainArgs[ callForType.indexes[ options.before ] ] = function( value ) {
			value *= 2;
			return options.after === options.before ? value : new Attempt( function() {
				callForType( arguments, options.afterAsync, options.after, value );
			} );
		};
		attempt = Attempt.prototype.chain.apply( attempt, chainArgs );
		forEachAction( function( methodName ) {
			attempt[ methodName ]( expectedCallback( methodName, options.after, 10 ) );
		} );
		setTimeout( function() {
			__.done();
		}, 10 );
	}
} );
