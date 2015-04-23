"use strict";

/* global QUnit */

require( "native-promise-only" );

var qUnitToNodeunit = require( "./qUnitToNodeunit" );

function handleTest( name, func ) {
	QUnit.test( name, function( qUnitObject ) {
		return new Promise( function( resolve ) {
			func( qUnitToNodeunit( qUnitObject, resolve ) );
		} );
	} );
}

function handleModule( groupName, tests ) {
	QUnit.module( groupName );
	for ( var name in tests ) {
		if ( tests.hasOwnProperty( name ) ) {
			handleTest( name, tests[ name ] );
		}
	}
}

handleModule( "later", require( "../01 - later" ) );
handleModule( "oneShotCallbacks", require( "../02 - oneShotCallbacks" ) );
handleModule( "repeatCallbacks", require( "../03 - repeatCallbacks" ) );
handleModule( "forEachAction", require( "../04 - forEachAction" ) );
handleModule( "Attempt", require( "../05 - Attempt" ) );
handleModule( "Attempt chain", require( "../06 - Attempt.chain.js" ) );
handleModule( "Attempt abort", require( "../07 - Attempt.abort.js" ) );
handleModule( "Attempt promise", require( "../08 - Attempt.promise.js" ) );
handleModule( "Attempt join", require( "../09 - Attempt.join.js" ) );
