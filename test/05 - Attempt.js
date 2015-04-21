"use strict";

var Attempt = require( "../lib/Attempt.js" );

module.exports = {
	"base": function( __ ) {
		__.expect( 7 );
		var iteration = 0;
		new Attempt( function( success, failure, progress ) {
			__.ok( true, "init called" );
			setTimeout( function() {
				progress( "PROG1" );
			}, 1 );
			setTimeout( function() {
				progress( "PROG2" );
			}, 2 );
			setTimeout( function() {
				success( "DONE" );
				success( "DONE2" );
				failure( "UNDONE" );
				failure( "UNDONE2" );
			}, 3 );
		} ).progress( function( param ) {
			iteration++;
			__.strictEqual( param, "PROG" + iteration, "correct progress value (" + iteration + ")" );
		} ).success( function( param ) {
			__.strictEqual( param, "DONE", "success" );
		} ).failure( function() {
			__.ok( false, "failure" );
		} ).progress( function( param ) {
			__.strictEqual( param, "PROG" + iteration, "correct progress value in second callback (" + iteration + ")" );
		} ).always( function( param ) {
			__.strictEqual( param, "DONE", "always" );
			__.done();
		} );
	}
};
