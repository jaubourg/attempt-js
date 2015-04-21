"use strict";

var later = require( "../lib/later" );

module.exports = {
	"order": function( __ ) {
		var string = "";
		__.expect( 1 );
		later( function() {
			later( function() {
				__.strictEqual( string, "ABC", "Proper order" );
				__.done();
			} );
			string += "B";
		} );
		later( function() {
			string += "C";
		} );
		string += "A";
	},
	"arguments": function( __ ) {
		var param0 = {};
		var param1 = {};
		__.expect( 5 );
		later( function() {
			__.strictEqual( arguments.length, 0, "no arguments in, zero-length arguments out" );
		} );
		later( function() {
			__.strictEqual( arguments.length, 0, "zero-length arguments in, zero-length arguments out" );
		}, [] );
		later( function() {
			__.strictEqual( arguments.length, 2, "two arguments" );
			__.strictEqual( arguments[ 0 ], param0, "first argument ok" );
			__.strictEqual( arguments[ 1 ], param1, "second argument ok" );
			__.done();
		}, [ param0, param1 ] );
	}
};
