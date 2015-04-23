"use strict";

var Test = require( "tape/lib/test" );

var nodeunitToTapeMethod = {
	"ok": true,
	"equal": "deepLooseEqual",
	"notEqual": "notDeepLooseEqual",
	"strictEqual": "equal",
	"notStrictEqual": "notEqual",
	"deepEqual": true,
	"notDeepEqual": true,
	"throws": true,
	"doesNotThrow": true,
	"expect": "plan",
	"done": "end"
};

function Nodeunit( tapeObject ) {
	this.__tapeObject = tapeObject;
}

function createMethod( name ) {
	var targetMethod = nodeunitToTapeMethod[ name ];
	if ( targetMethod === true ) {
		targetMethod = name;
	}
	targetMethod = Test.prototype[ targetMethod ];
	Nodeunit.prototype[ name ] = function() {
		return targetMethod.apply( this.__tapeObject, arguments );
	};
}

for ( var name in nodeunitToTapeMethod ) {
	if ( nodeunitToTapeMethod.hasOwnProperty( name ) ) {
		createMethod( name, nodeunitToTapeMethod[ name ] );
	}
}

module.exports = function( tapeObject ) {
	return new Nodeunit( tapeObject );
};
