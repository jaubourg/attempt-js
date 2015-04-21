"use strict";

var forEachAction = require( "../lib/forEachAction" );

module.exports = {
	"base": function( __ ) {
		__.expect( 1 );
		var results = [];
		forEachAction( [ 1, 2, 3 ], function() {
			results.push( [].slice.call( arguments ) );
		} );
		__.deepEqual( results, [
			[ 3, "progress", 2 ],
			[ 2, "failure", 1 ],
			[ 1, "success", 0 ]
		], "ok" );
		__.done();
	},
	"no array": function( __ ) {
		__.expect( 1 );
		var results = [];
		forEachAction( function() {
			results.push( [].slice.call( arguments ) );
		} );
		__.deepEqual( results, [
			[ "progress", "progress", 2 ],
			[ "failure", "failure", 1 ],
			[ "success", "success", 0 ]
		], "ok" );
		__.done();
	}
};
