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

function progressAttempt( progressValues ) {
	progressValues = progressValues.slice();
	return new Attempt( function( success, failure, progress ) {
		function go() {
			if ( progressValues.length ) {
				setTimeout( go, 2 );
				progress( progressValues.shift() );
			} else {
				success();
			}
		}
		setTimeout( go, 2 );
	} );
}

createTests( {
	target: module.exports,
	possibilities: {
		array: [ false, true ],
		progress1: [ [], [ 1 ], [ 1, 2 ] ],
		progress2: [ [], [ 1 ], [ 1, 2 ] ]
	},
	check: function( options ) {
		var length = Math.max( options.progress1.length, options.progress2.length );
		var progressArray = [];
		var latest = [ undefined, undefined ];
		for ( var i = 0; i < length; i++ ) {
			if ( i < options.progress1.length ) {
				progressArray.push( ( latest = [ options.progress1[ i ], latest[ 1 ] ] ) );
			}
			if ( i < options.progress2.length ) {
				progressArray.push( ( latest = [ latest[ 0 ], options.progress2[ i ] ] ) );
			}
		}
		options.outcome = progressArray;
		return true;
	},
	name: function( options ) {
		return "Array.join" + ( options.array ? "Array " : " " ) + "/ progress ( " +
			JSON.stringify( options.progress1 ) + ", " +
			JSON.stringify( options.progress2 ) + ")";
	},
	test: function( options, __ ) {
		__.expect( 1 + options.outcome.length );
		var progressIndex = 0;
		(
			options.array ?
				Attempt.joinArray( [
					progressAttempt( options.progress1 ),
					progressAttempt( options.progress2 )
				] ) :
				Attempt.join(
					progressAttempt( options.progress1 ),
					progressAttempt( options.progress2 )
				)
		).success( function() {
			__.ok( true, "success" );
		} ).progress( function() {
			__.deepEqual( [].slice.call( arguments ), options.outcome[ ( progressIndex++ ) ],
				"progress #" + progressIndex );
		} ).always( function() {
			__.done();
		} );
	}
} );
