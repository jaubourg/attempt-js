"use strict";

var Attempt = require( "../lib/Attempt.js" );

var callForType = require( "./util/callForType.js" );
var createTests = require( "./util/createTests.js" );

var rPromise = /^promise-/;
var rValue = /^value-/;
var rFailure = /failure$/;

var firstSecond = [ "first", "second" ];

function forEachParam( options, callback ) {
	for ( var i = 0; i < 2; i++ ) {
		callback( options[ firstSecond[ i ] ], options[ firstSecond[ i ] + "Async" ] );
	}
}

function createParam( type, async, args ) {
	if ( type === "value-success" ) {
		return args[ 0 ];
	}
	if ( rPromise.test( type ) ) {
		return new Promise( function() {
			callForType( arguments, async, type.replace( rPromise, "" ), args );
		} );
	}
	return new Attempt( function() {
		callForType( arguments, async, type, args );
	} );
}

module.exports = {
	"Attempt.join()": function( __ ) {
		__.expect( 1 );
		Attempt.join().success( function() {
			__.strictEqual( arguments.length, 0, "no argument" );
		} ).failure( function() {
			__.ok( false, "failure" );
		} ).always( function() {
			__.done();
		} );
	},
	"Attempt.joinArray( [] )": function( __ ) {
		__.expect( 1 );
		Attempt.joinArray( [] ).success( function() {
			__.strictEqual( arguments.length, 0, "no argument" );
		} ).failure( function() {
			__.ok( false, "failure" );
		} ).always( function() {
			__.done();
		} );
	}
};

createTests( {
	target: module.exports,
	possibilities: {
		array: [ false, true ],
		first: [ "value-success", "success", "failure", "promise-success", "promise-failure" ],
		second: [ "value-success", "success", "failure", "promise-success", "promise-failure" ],
		firstAsync: [ true, false ],
		secondAsync: [ true, false ],
		firstArgs: [ [], [ "string" ], [ 23, true ] ],
		secondArgs: [ [], [ "string" ], [ 23, true ] ]
	},
	check: function( options ) {
		var ok = true;
		options.outcome = "success";
		forEachParam( options, function( type, async ) {
			if ( async && rValue.test( type ) ) {
				ok = false;
			}
			if ( rFailure.test( type ) ) {
				options.outcome = "failure";
			}
		} );
		options.outcomeValue = [
			( !rPromise.test( options.first ) && !rValue.test( options.first ) && options.firstArgs.length > 1 ) ?
				options.firstArgs : options.firstArgs[ 0 ],
			( !rPromise.test( options.second ) && !rValue.test( options.second )  && options.secondArgs.length > 1 ) ?
				options.secondArgs : options.secondArgs[ 0 ]
		];
		return ok;
	},
	name: function( options ) {
		var params = [];
		forEachParam( options, function( type, async ) {
			params.push(
				rValue.test( type ) ?
				"value" :
				( async ? "async " : "sync " ) + type
			);
		} );
		return "Attempt.join" + ( options.array ? "Array" : "" ) + "( " + params.join( ", " ) + " ) => " +
			options.outcome + "( " + JSON.stringify( options.outcomeValue[ 0 ] ) + ", " +
			JSON.stringify( options.outcomeValue[ 1 ] ) + " )";
	},
	test: function( options, __ ) {
		__.expect( options.outcome === "failure" ? 1 : 2 );
		(
			options.array ?
			Attempt.joinArray( [
				createParam( options.first, options.firstAsync, options.firstArgs ),
				createParam( options.second, options.secondAsync, options.secondArgs )
			] ) :
			Attempt.join(
				createParam( options.first, options.firstAsync, options.firstArgs ),
				createParam( options.second, options.secondAsync, options.secondArgs )
			)
		).success( function() {
			__.ok( options.outcome === "success", "success" );
			__.deepEqual( [].slice.apply( arguments ), options.outcomeValue, "params OK" );
		} ).failure( function() {
			__.ok( options.outcome === "failure" , "failure" );
		} ).always( function() {
			__.done();
		} );
	}
} );
