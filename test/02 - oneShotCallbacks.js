"use strict";

var oneShotCallbacks = require( "../lib/oneShotCallbacks" );

module.exports = {
	"base": function( __ ) {
		__.expect( 7 );
		var callbacks = oneShotCallbacks();
		var async = false;
		callbacks.a( function( arg1, arg2 ) {
			__.ok( async, "is async" );
			__.strictEqual( arguments.length, 2, "1 - two args" );
			__.strictEqual( arg1, "ARG1", "1 - arg1 ok" );
			__.strictEqual( arg2, "ARG2", "1 - arg2 ok" );
		} ).a( function( arg1, arg2 ) {
			__.strictEqual( arguments.length, 2, "2 - two args" );
			__.strictEqual( arg1, "ARG1", "2 - arg1 ok" );
			__.strictEqual( arg2, "ARG2", "2 - arg2 ok" );
			__.done();
		} ).f( "ARG1", "ARG2" );
		callbacks.f( "ARG3" );
		async = true;
	},
	"memory": function( __ ) {
		__.expect( 3 );
		var callbacks = oneShotCallbacks();
		setTimeout( callbacks.a, 10, function( param ) {
			__.strictEqual( param, "ARG", "added later" );
			__.done();
		} );
		callbacks.a( function( param ) {
			__.strictEqual( param, "ARG", "added before" );
		} ).f( "ARG" );
		callbacks.a( function( param ) {
			__.strictEqual( param, "ARG", "added right after" );
		} );
	},
	"lock": function( __ ) {
		__.expect( 1 );
		var callbacks = oneShotCallbacks();
		setTimeout( callbacks.a, 10, function() {
			__.ok( false, "later" );
		} );
		setTimeout( function() {
			__.ok( true, "done" );
			__.done();
		}, 10 );
		callbacks.a( function() {
			__.ok( false, "before" );
		} ).l();
		callbacks.f( "ARG" );
		callbacks.a( function() {
			__.ok( false, "right after" );
		} );
	}
};
