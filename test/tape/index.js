"use strict";

var tapeToNodeunit = require( "./tapeToNodeunit" );
var test = require( "tape" );

function handleTest( name, func ) {
	test( name, function( tapeObject ) {
		func( tapeToNodeunit( tapeObject ) );
	} );
}

function handleModule( prepend, tests ) {
	prepend += ": ";
	for ( var key in tests ) {
		if ( tests.hasOwnProperty( key ) ) {
			handleTest( prepend + key, tests[ key ] );
		}
	}
}

handleModule( "later", require( "../01 - later" ) );
handleModule( "oneShotCallbacks", require( "../02 - oneShotCallbacks" ) );
handleModule( "repeatCallbacks", require( "../03 - repeatCallbacks" ) );
handleModule( "forEachAction", require( "../04 - forEachAction" ) );
handleModule( "Attempt", require( "../05 - Attempt" ) );
handleModule( "Attempt chain", require( "../06 - Attempt.chain" ) );
handleModule( "Attempt abort", require( "../07 - Attempt.abort" ) );
handleModule( "Attempt promise", require( "../08 - Attempt.promise" ) );
handleModule( "Attempt join", require( "../09 - Attempt.join" ) );
