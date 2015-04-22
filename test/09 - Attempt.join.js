"use strict";

var Attempt = require( "../lib/Attempt.js" );

var callForType = require( "./util/callForType.js" );
var createTests = require( "./util/createTests.js" );

var rPromise = /^promise-/;
var rValue = /^value-/;
var rSuccess = /success$/;
var rFailure = /failure$/;

var firstSecondThird = [ "first", "second", "third" ];

function forEachParam( callback ) {
	for ( var i = 0; i < 3; i++ ) {
		callback( firstSecondThird[ i ] );
	}
}

function createParam( type, async ) {
	if ( type === "value-success" ) {
		return "OK";
	}
	if ( rPromise.test( type ) ) {
		return new Promise( function() {
			callForType( arguments, async, type.replace( rPromise, "" ), rSuccess.test( type ) ? "OK" : "NOK" );
		} );
	}
	return new Attempt( function() {
		callForType( arguments, async, type, rSuccess.test( type ) ? "OK" : "NOK" );
	} );
}

createTests( {
	target: module.exports,
	possibilities: {
		first: [ "value-success", "success", "failure", "promise-success", "promise-failure" ],
		firstAsync: [ true, false ],
		second: [ "value-success", "success", "failure", "promise-success", "promise-failure" ],
		secondAsync: [ true, false ],
		third: [ "value-success", "success", "failure", "promise-success", "promise-failure" ],
		thirdAsync: [ true, false ],
		array: [ true, false ]
	},
	check: function( options ) {
		var ok = true;
		var success = true;
		forEachParam( function( name ) {
			if ( options[ name + "Async" ] && rValue.test( options[ name ] ) ) {
				ok = false;
			}
			if ( rFailure.test( options[ name ] ) ) {
				success = false;
			}
		} );
		options.outcome = success ? "success" : "failure";
		return ok;
	},
	name: function( options ) {
		var params = [];
		forEachParam( function( name ) {
			params.push(
				rValue.test( options[ name ] ) ?
				"value" :
				( options[ name + "Async" ] ? "async " : "sync " ) + options[ name ]
			);
		} );
		return "Attempt.join" + ( options.array ? "Array" : "" ) + "( " + params.join( ", " ) + " ) => " +
			options.outcome;
	},
	test: function( options, __ ) {
		__.expect( 2 );
		(
			options.array ?
			Attempt.joinArray( [
				createParam( options.first, options.firstAsync ),
				createParam( options.second, options.secondAsync ),
				createParam( options.third, options.thirdAsync )
			] ) :
			Attempt.join(
				createParam( options.first, options.firstAsync ),
				createParam( options.second, options.secondAsync ),
				createParam( options.third, options.thirdAsync )
			)
		).success( function() {
			__.ok( options.outcome === "success", "success" );
			__.deepEqual( [].slice.apply( arguments ), [ "OK", "OK", "OK" ], "params OK" );
		} ).failure( function() {
			__.ok( options.outcome === "failure" , "failure" );
			__.deepEqual( [].slice.apply( arguments ), [ "NOK" ], "params OK" );
		} ).always( function() {
			__.done();
		} );
	}
} );
