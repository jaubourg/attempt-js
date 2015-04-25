"use strict";

function NodeUnit( qUnit, done ) {
	this._qUnit = qUnit;
	this._done = done;
}

NodeUnit.prototype = {
	ok: function() {
		return this._qUnit.ok.apply( this._qUnit, arguments );
	},
	equal: function() {
		return this._qUnit.equal.apply( this._qUnit, arguments );
	},
	notEqual: function() {
		return this._qUnit.notEqual.apply( this._qUnit, arguments );
	},
	strictEqual: function() {
		return this._qUnit.strictEqual.apply( this._qUnit, arguments );
	},
	notStrictEqual: function() {
		return this._qUnit.notStrictEqual.apply( this._qUnit, arguments );
	},
	deepEqual: function() {
		return this._qUnit.deepEqual.apply( this._qUnit, arguments );
	},
	notDeepEqual: function() {
		return this._qUnit.notDeepEqual.apply( this._qUnit, arguments );
	},
	throws: function() {
		return this._qUnit.throws.apply( this._qUnit, arguments );
	},
	expect: function() {
		return this._qUnit.expect.apply( this._qUnit, arguments );
	},
	done: function() {
		this._done();
	}
};

var QUnit = require( "qunitjs" );
var Promise = require( "es6-promise" ).Promise;


var adapter = module.exports = {
	test: function( name, test ) {
		QUnit.test( name, function( qUnitObject ) {
			return new Promise( function( resolve ) {
				test( new NodeUnit( qUnitObject, resolve ) );
			} );
		} );
	},
	module: function( name, tests ) {
		QUnit.module( name );
		for ( var name in tests ) {
			if ( tests.hasOwnProperty( name ) ) {
				adapter.test( name, tests[ name ] );
			}
		}
	}
};
