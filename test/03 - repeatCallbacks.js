"use strict";

var repeatCallbacks = require( "../lib/repeatCallbacks" );

module.exports = {
	"base": function( __ ) {
		__.expect( 7 );
		var callbacks = repeatCallbacks();
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
		async = true;
	},
	"memory": function( __ ) {
		__.expect( 3 );
		var callbacks = repeatCallbacks();
		setTimeout( function() {
			callbacks.a( function( param ) {
				__.strictEqual( param, "ARG", "added later" );
				__.done();
			} );
		}, 10 );
		callbacks.a( function( param ) {
			__.strictEqual( param, "ARG", "added before" );
		} ).f( "ARG" );
		callbacks.a( function( param ) {
			__.strictEqual( param, "ARG", "added right after" );
		} );
	},
	"memory with multiple fire": function( __ ) {
		__.expect( 4 );
		var callbacks = repeatCallbacks();
		var iteration = 0;
		callbacks.a( function() {
			iteration++;
		} );
		setTimeout( function() {
			callbacks.a( function( param ) {
				__.strictEqual( param, "ARG2", "added later" );
				__.done();
			} );
		} , 10 );
		callbacks.a( function( param ) {
			__.strictEqual( param, "ARG" + iteration, "added before (" + iteration + ")" );
		} ).f( "ARG1" );
		callbacks.f( "ARG2" );
		callbacks.a( function( param ) {
			__.strictEqual( param, "ARG2", "added right after" );
		} );
	},
	"lock": function( __ ) {
		__.expect( 1 );
		var callbacks = repeatCallbacks();
		setTimeout( function() {
			callbacks.a( function() {
				__.ok( false, "later" );
			} );
		}, 10 );
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
	},
	"lock after fire": function( __ ) {
		var callbacks = repeatCallbacks();
		setTimeout( function() {
			callbacks.a( function( param ) {
				__.strictEqual( param, "ARG", "added later" );
				__.done();
			} );
		}, 10 );
		callbacks.a( function( param ) {
			__.strictEqual( param, "ARG", "added before" );
		} ).f( "ARG" );
		callbacks.a( function( param ) {
			__.strictEqual( param, "ARG", "added right after" );
		} ).l();
		callbacks.f( "ARG2" );
	}
};
